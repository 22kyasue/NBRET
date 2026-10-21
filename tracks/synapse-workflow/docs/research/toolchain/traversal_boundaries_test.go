package toolchain_test

import (
 "context"
 "errors"
 "reflect"
 "testing"
 "time"
 "github.com/specterops/dawgs/graph"
 "github.com/specterops/dawgs/ops"
 "github.com/specterops/dawgs/traversal"
 "github.com/specterops/dawgs/util/size"
)

type fixtureTx struct { graph.Transaction; limit size.Size }
func (tx fixtureTx) GraphQueryMemoryLimit() size.Size { return tx.limit }
type fixtureDB struct { graph.Database; tx fixtureTx }
func (db fixtureDB) ReadTransaction(ctx context.Context, f graph.TransactionDelegate, _ ...graph.TransactionOption) error { return f(db.tx) }

func TestSyntheticTraversalBoundaries(t *testing.T) {
 t.Run("finite_chain",func(t *testing.T){
  ctx,cancel:=context.WithTimeout(context.Background(),2*time.Second);defer cancel()
  var visited []graph.ID
  err:=traversal.New(fixtureDB{},1).BreadthFirst(ctx,traversal.Plan{Root:graph.NewNode(1,nil),Driver:func(_ context.Context,_ graph.Transaction,s *graph.PathSegment)([]*graph.PathSegment,error){
   visited=append(visited,s.Node.ID)
   if s.Node.ID>=3{return nil,nil}
   n:=graph.NewNode(s.Node.ID+1,nil)
   return []*graph.PathSegment{s.Descend(n,graph.NewRelationship(s.Node.ID,s.Node.ID,n.ID,nil,graph.StringKind("fixture")))},nil
  }})
  if err!=nil||!reflect.DeepEqual(visited,[]graph.ID{1,2,3}){t.Fatalf("err=%v visits=%v",err,visited)}
  t.Logf("visits=%v err=%v",visited,err)
 })
 t.Run("sentinel_error",func(t *testing.T){
  ctx,cancel:=context.WithTimeout(context.Background(),2*time.Second);defer cancel()
  sentinel:=errors.New("synthetic driver failure")
  err:=traversal.New(fixtureDB{},1).BreadthFirst(ctx,traversal.Plan{Root:graph.NewNode(1,nil),Driver:func(context.Context,graph.Transaction,*graph.PathSegment)([]*graph.PathSegment,error){return nil,sentinel}})
  if !errors.Is(err,sentinel){t.Fatalf("err=%v",err)}
  t.Logf("sentinel propagated=%v",err)
 })
 t.Run("cancelled_partial",func(t *testing.T){
  ctx,cancel:=context.WithTimeout(context.Background(),2*time.Second);defer cancel()
  visits:=0
  err:=traversal.New(fixtureDB{},1).BreadthFirst(ctx,traversal.Plan{Root:graph.NewNode(1,nil),Driver:func(context.Context,graph.Transaction,*graph.PathSegment)([]*graph.PathSegment,error){visits++;cancel();return nil,context.Canceled}})
  if err!=nil||visits!=1||!errors.Is(ctx.Err(),context.Canceled){t.Fatalf("err=%v visits=%v ctx=%v",err,visits,ctx.Err())}
  t.Logf("visits=%d aggregate=%v context=%v",visits,err,ctx.Err())
 })
 t.Run("memory_limit",func(t *testing.T){
  ctx,cancel:=context.WithTimeout(context.Background(),2*time.Second);defer cancel()
  visits:=0
  err:=traversal.New(fixtureDB{tx:fixtureTx{limit:1}},1).BreadthFirst(ctx,traversal.Plan{Root:graph.NewNode(1,nil),Driver:func(context.Context,graph.Transaction,*graph.PathSegment)([]*graph.PathSegment,error){visits++;return nil,nil}})
  if !errors.Is(err,ops.ErrGraphQueryMemoryLimit)||visits!=0{t.Fatalf("err=%v visits=%d",err,visits)}
  t.Logf("visits=%d err=%v",visits,err)
 })
}

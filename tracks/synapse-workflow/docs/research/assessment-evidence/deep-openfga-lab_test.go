// Research overlay only; no upstream files are changed.
package graph

import (
 "context"
 "errors"
 "testing"
 "time"

 openfgav1 "github.com/openfga/api/proto/openfga/v1"
 "google.golang.org/protobuf/types/known/structpb"
 "github.com/openfga/openfga/pkg/storage/cache/keys"
)

type researchCache map[keys.Key]any
func (c researchCache) Get(k keys.Key) any { return c[k] }
func (c researchCache) Set(k keys.Key, v any, _ time.Duration) { c[k]=v }
func (c researchCache) Delete(k keys.Key) { delete(c,k) }
func (c researchCache) Stop() {}
type researchDelegate struct { calls int; allowed, cycle bool; err error }
func (d *researchDelegate) ResolveCheck(context.Context,*ResolveCheckRequest)(*ResolveCheckResponse,error) {
 d.calls++
 if d.err!=nil {return nil,d.err}
 return &ResolveCheckResponse{Allowed:d.allowed,ResolutionMetadata:ResolveCheckResponseMetadata{CycleDetected:d.cycle}},nil
}
func (d *researchDelegate) Close(){}
func (d *researchDelegate) SetDelegate(CheckResolver){}
func (d *researchDelegate) GetDelegate() CheckResolver{return nil}
func researchReq(t *testing.T, store, model, user, region string) *ResolveCheckRequest {
 t.Helper()
 ctx,_:=structpb.NewStruct(map[string]any{"region":region})
 r,e:=NewResolveCheckRequest(ResolveCheckRequestParams{StoreID:store,AuthorizationModelID:model,
 TupleKey:&openfgav1.TupleKey{Object:"doc:synthetic",Relation:"viewer",User:user},Context:ctx})
 if e!=nil {t.Fatal(e)}
 return r
}
func TestResearchCacheConsistency(t *testing.T){
 d:=&researchDelegate{allowed:true}
 c,e:=NewCachedCheckResolver(WithExistingCache(researchCache{}));if e!=nil{t.Fatal(e)};defer c.Close();c.SetDelegate(d)
 req:=researchReq(t,"store-a","model-a","user:a","a")
 r,e:=c.ResolveCheck(context.Background(),req);if e!=nil||!r.Allowed||d.calls!=1{t.Fatal("first allow",r,e,d.calls)}
 d.allowed=false
 r,e=c.ResolveCheck(context.Background(),req);if e!=nil||!r.Allowed||d.calls!=1{t.Fatal("expected cached allow",r,e,d.calls)}
 req.Consistency=openfgav1.ConsistencyPreference_HIGHER_CONSISTENCY
 r,e=c.ResolveCheck(context.Background(),req);if e!=nil||r.Allowed||d.calls!=2{t.Fatal("higher consistency must delegate",r,e,d.calls)}
 req.Consistency=openfgav1.ConsistencyPreference_MINIMIZE_LATENCY
 req.LastCacheInvalidationTime=time.Now().Add(time.Second)
 r,e=c.ResolveCheck(context.Background(),req);if e!=nil||r.Allowed||d.calls!=3{t.Fatal("invalidation must delegate",r,e,d.calls)}
 t.Log("normal request reused cached allow after delegate changed; higher consistency and newer invalidation delegated")
}
func TestResearchCacheIdentity(t *testing.T){
 d:=&researchDelegate{allowed:true}
 c,e:=NewCachedCheckResolver(WithExistingCache(researchCache{}));if e!=nil{t.Fatal(e)};defer c.Close();c.SetDelegate(d)
 for _,v:=range [][4]string{{"s","m","user:a","a"},{"other","m","user:a","a"},{"s","other","user:a","a"},{"s","m","user:b","a"},{"s","m","user:a","b"}}{
  _,e=c.ResolveCheck(context.Background(),researchReq(t,v[0],v[1],v[2],v[3]));if e!=nil{t.Fatal(e)}
 }
 if d.calls!=5{t.Fatal("identity variants unexpectedly reused verdict",d.calls)}
 t.Log("five store/model/actor/context variants delegated separately")
}
func TestResearchErrorsAndCyclesNotCached(t *testing.T){
 for _,kind:=range []string{"error","cycle"}{t.Run(kind,func(t *testing.T){
  d:=&researchDelegate{allowed:false};if kind=="error"{d.err=errors.New("synthetic") }else{d.cycle=true}
  c,e:=NewCachedCheckResolver(WithExistingCache(researchCache{}));if e!=nil{t.Fatal(e)};defer c.Close();c.SetDelegate(d)
  req:=researchReq(t,"s","m","user:a","a")
  for range 2{_,_=c.ResolveCheck(context.Background(),req)}
  if d.calls!=2{t.Fatal("indeterminate outcome cached",kind,d.calls)}
 })}
}

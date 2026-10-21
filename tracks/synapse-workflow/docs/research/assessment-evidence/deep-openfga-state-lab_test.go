package check

import (
 "context"
 "errors"
 "sync"
 "testing"
 "time"
 openfgav1 "github.com/openfga/api/proto/openfga/v1"
 "github.com/oklog/ulid/v2"
 "github.com/openfga/openfga/internal/iterator"
 "github.com/openfga/openfga/internal/modelgraph"
 "github.com/openfga/openfga/internal/planner"
 "github.com/openfga/openfga/pkg/storage"
 "github.com/openfga/openfga/pkg/storage/cache/keys"
 "github.com/openfga/openfga/pkg/storage/memory"
 "github.com/openfga/openfga/pkg/tuple"
)
type evidenceMapCache struct {mu sync.Mutex; data map[keys.Key]any}
func(c *evidenceMapCache)Get(k keys.Key)any{c.mu.Lock();defer c.mu.Unlock();return c.data[k]}
func(c *evidenceMapCache)Set(k keys.Key,v any,_ time.Duration){c.mu.Lock();defer c.mu.Unlock();c.data[k]=v}
func(c *evidenceMapCache)Delete(k keys.Key){c.mu.Lock();defer c.mu.Unlock();delete(c.data,k)}
func(c *evidenceMapCache)Stop(){}
func evidenceModel()*openfgav1.AuthorizationModel{return &openfgav1.AuthorizationModel{
 Id:ulid.Make().String(),SchemaVersion:"1.1",TypeDefinitions:[]*openfgav1.TypeDefinition{
 {Type:"user"},{Type:"doc",Relations:map[string]*openfgav1.Userset{"viewer":{Userset:&openfgav1.Userset_This{This:&openfgav1.DirectUserset{}}}},
 Metadata:&openfgav1.Metadata{Relations:map[string]*openfgav1.RelationMetadata{"viewer":{DirectlyRelatedUserTypes:[]*openfgav1.RelationReference{{Type:"user"}}}}}},
 }}}
func TestEvidenceActualGrantRevoke(t *testing.T){
 ctx:=context.Background();ds:=memory.New();defer ds.Close();model:=evidenceModel()
 mg,e:=modelgraph.New(model);if e!=nil{t.Fatal(e)}
 tk:=tuple.NewTupleKey("doc:synthetic","viewer","user:synthetic")
 if e=ds.Write(ctx,"synthetic",nil,[]*openfgav1.TupleKey{tk});e!=nil{t.Fatal(e)}
 plan:=planner.NewNoopPlanner();defer plan.Stop()
 resolver:=New(Config{Model:mg,Datastore:ds,ConcurrencyLimit:2,Planner:plan,Cache:&evidenceMapCache{data:make(map[keys.Key]any)},CacheTTL:time.Minute})
 req,e:=NewRequest(RequestParams{StoreID:"synthetic",Model:mg,TupleKey:tk});if e!=nil{t.Fatal(e)}
 r,e:=resolver.ResolveCheck(ctx,req);if e!=nil||!r.GetAllowed(){t.Fatal("grant",r,e)}
 if e=ds.Write(ctx,"synthetic",[]*openfgav1.TupleKeyWithoutCondition{{Object:tk.Object,Relation:tk.Relation,User:tk.User}},nil);e!=nil{t.Fatal(e)}
 r,e=resolver.ResolveCheck(ctx,req);if e!=nil||!r.GetAllowed(){t.Fatal("expected stale cache allow",r,e)}
 req.Consistency=openfgav1.ConsistencyPreference_HIGHER_CONSISTENCY
 r,e=resolver.ResolveCheck(ctx,req);if e!=nil||r.GetAllowed(){t.Fatal("fresh tuple denial",r,e)}
 t.Log("actual synthetic tuple grant -> allow; revoke -> cached allow; higher consistency -> deny")
}
func TestEvidenceStoreDescriptorNotErasure(t *testing.T){
 ctx:=context.Background();ds:=memory.New();defer ds.Close();const store="synthetic-deletion"
 if _,e:=ds.CreateStore(ctx,&openfgav1.Store{Id:store,Name:"synthetic"});e!=nil{t.Fatal(e)}
 model:=evidenceModel();if e:=ds.WriteAuthorizationModel(ctx,store,model);e!=nil{t.Fatal(e)}
 tk:=tuple.NewTupleKey("doc:synthetic","viewer","user:synthetic")
 if e:=ds.Write(ctx,store,nil,[]*openfgav1.TupleKey{tk});e!=nil{t.Fatal(e)}
 if e:=ds.WriteAssertions(ctx,store,model.Id,[]*openfgav1.Assertion{{Expectation:true}});e!=nil{t.Fatal(e)}
 if e:=ds.DeleteStore(ctx,store);e!=nil{t.Fatal(e)}
 if _,e:=ds.GetStore(ctx,store);!errors.Is(e,storage.ErrNotFound){t.Fatal("descriptor remains",e)}
 if _,e:=ds.ReadUserTuple(ctx,store,storage.ReadUserTupleFilter{Object:tk.Object,Relation:tk.Relation,User:tk.User},storage.ReadUserTupleOptions{});e!=nil{t.Fatal("tuple unexpectedly erased",e)}
 if _,e:=ds.ReadAuthorizationModel(ctx,store,model.Id);e!=nil{t.Fatal("model unexpectedly erased",e)}
 a,e:=ds.ReadAssertions(ctx,store,model.Id);if e!=nil||len(a)!=1{t.Fatal("assertions",a,e)}
 t.Log("descriptor absent; internal tuples/model/assertions remain; no public API accessibility claim")
}
func TestEvidenceFilterErrorPolicy(t *testing.T){
 ctx:=context.Background();sentinel:=errors.New("synthetic nonfatal condition error")
 fn:=func(s string)(bool,error){if s=="error"{return false,sentinel};return true,nil}
 iter:=iterator.NewFilteredIterator(storage.NewStaticIterator([]string{"error","valid"}),fn);defer iter.Stop()
 v,e:=iter.Next(ctx);if e!=nil||v!="valid"{t.Fatal(v,e)}
 _,e=iter.Next(ctx);if !errors.Is(e,storage.ErrIteratorDone){t.Fatal("expected suppressed prior error",e)}
 control:=iterator.NewFilteredIterator(storage.NewStaticIterator([]string{"error"}),fn);defer control.Stop()
 _,e=control.Next(ctx);if !errors.Is(e,sentinel){t.Fatal("all-error control",e)}
 t.Log("nonfatal error then valid => valid/Done; all-error => error; partial evidence policy, not full resolution claim")
}

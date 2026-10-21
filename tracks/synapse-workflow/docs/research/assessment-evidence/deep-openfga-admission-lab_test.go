package commands

import (
 "context"
 "testing"
 openfgav1 "github.com/openfga/api/proto/openfga/v1"
 "github.com/openfga/openfga/pkg/storage/memory"
 "github.com/openfga/openfga/pkg/typesystem"
)

// Ordinary command admission, not a server/transport authorization test.
func TestEvidenceOrdinaryModelAdmission(t *testing.T) {
 ctx:=context.Background(); db:=memory.New(); defer db.Close()
 command:=NewWriteAuthorizationModelCommand(db)
 request:=func(expression string)*openfgav1.WriteAuthorizationModelRequest{return &openfgav1.WriteAuthorizationModelRequest{
  StoreId:"synthetic-store",SchemaVersion:"1.1",
  TypeDefinitions:[]*openfgav1.TypeDefinition{{Type:"user"}},
  Conditions:map[string]*openfgav1.Condition{"ordinary":{Name:"ordinary",Expression:expression}},
 }}
 if response,err:=command.Execute(ctx,request("true ???"));err==nil||response!=nil{t.Fatalf("invalid model admitted: %v %v",response,err)}
 if model,err:=db.FindLatestAuthorizationModel(ctx,"synthetic-store");err==nil||model!=nil{t.Fatalf("invalid model persisted: %v %v",model,err)}
 response,err:=command.Execute(ctx,request("true"));if err!=nil{t.Fatal(err)}
 resolve,stop,err:=typesystem.MemoizedTypesystemResolverFunc(db,10);if err!=nil{t.Fatal(err)};defer stop()
 first,err:=resolve(ctx,"synthetic-store",response.GetAuthorizationModelId());if err!=nil{t.Fatal(err)}
 second,err:=resolve(ctx,"synthetic-store",response.GetAuthorizationModelId());if err!=nil{t.Fatal(err)}
 if first!=second{t.Fatal("valid model was not reused")}
 t.Log("invalid CEL rejected with no persisted model; valid model persisted, loaded and reused")
}

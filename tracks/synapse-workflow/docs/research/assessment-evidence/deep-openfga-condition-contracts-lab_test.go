package condition
import (
 "context"
 "testing"
 openfgav1 "github.com/openfga/api/proto/openfga/v1"
 "google.golang.org/protobuf/types/known/structpb"
)
// Predefined ordinary controls: low cost rejects, sufficient cost succeeds;
// cancelled comprehension rejects, then the same program accepts a fresh context.
func TestEvidenceConditionCostAndCancellation(t *testing.T){
 model:=func()*openfgav1.Condition{return &openfgav1.Condition{Name:"ordinary_list",Expression:"xs.all(x, x > 0)",Parameters:map[string]*openfgav1.ConditionParamTypeRef{"xs":{TypeName:openfgav1.ConditionParamTypeRef_TYPE_NAME_LIST,GenericTypes:[]*openfgav1.ConditionParamTypeRef{{TypeName:openfgav1.ConditionParamTypeRef_TYPE_NAME_INT}}}}}}
 data,err:=structpb.NewStruct(map[string]any{"xs":[]any{1,2,3}});if err!=nil{t.Fatal(err)}
 low:=NewUncompiled(model()).WithMaxEvaluationCost(1).WithInterruptCheckFrequency(1)
 if result,err:=low.Evaluate(context.Background(),data.GetFields());err==nil{t.Fatalf("low cost accepted: %v",result)}
 ordinary:=NewUncompiled(model()).WithMaxEvaluationCost(1000).WithInterruptCheckFrequency(1)
 result,err:=ordinary.Evaluate(context.Background(),data.GetFields());if err!=nil||!result.ConditionMet||result.Cost==0{t.Fatal(result,err)}
 ctx,cancel:=context.WithCancel(context.Background());cancel()
 if result,err:=ordinary.Evaluate(ctx,data.GetFields());err==nil{t.Fatalf("cancelled comprehension accepted: %v",result)}
 result,err=ordinary.Evaluate(context.Background(),data.GetFields());if err!=nil||!result.ConditionMet{t.Fatal(result,err)}
 t.Log("three-element comprehension: low modeled cost rejected, sufficient cost accepted, cancellation rejected, fresh-context reuse accepted")
}
// Predefined representation question: protobuf string follows the observed converter;
// ordinary10 is preserved. This is not an application permission check.
func TestEvidenceProtobufConditionConversion(t *testing.T){
 c:=NewUncompiled(&openfgav1.Condition{Name:"ordinary_uint",Expression:"n == 18446744073709551615u",Parameters:map[string]*openfgav1.ConditionParamTypeRef{"n":{TypeName:openfgav1.ConditionParamTypeRef_TYPE_NAME_UINT}}})
 typed,err:=c.CastContextToTypedParameters(map[string]*structpb.Value{"n":structpb.NewStringValue("18446744073709551615")});if err!=nil||typed["n"]!=uint64(9223372036854775807){t.Fatal(typed,err)}
 result,err:=c.Evaluate(context.Background(),map[string]*structpb.Value{"n":structpb.NewStringValue("18446744073709551615")});if err!=nil||result.ConditionMet{t.Fatal(result,err)}
 small,err:=c.CastContextToTypedParameters(map[string]*structpb.Value{"n":structpb.NewStringValue("10")});if err!=nil||small["n"]!=uint64(10){t.Fatal(small,err)}
 t.Log("protobuf decimal string saturated before CEL comparison; max-uint equality false, ordinary10 preserved; no server/customer state")
}

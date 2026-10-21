package condition
import (
 "context"
 "testing"
 openfgav1 "github.com/openfga/api/proto/openfga/v1"
 "google.golang.org/protobuf/types/known/structpb"
)
func TestEvidenceFailedCompileState(t *testing.T){
 c:=NewUncompiled(&openfgav1.Condition{Name:"synthetic-invalid",Expression:"this is invalid CEL ???"})
 first:=c.Compile();if first==nil{t.Fatal("invalid expression compiled")}
 second:=c.Compile();if second!=nil{t.Fatal("source prediction changed: compile error retained",second)}
 panicked:=false
 func(){defer func(){panicked=recover()!=nil}();_,_=c.Evaluate(context.Background(),map[string]*structpb.Value{})}()
 if !panicked{t.Fatal("source prediction changed: no panic")}
 t.Log("first compile error; second compile nil; later evaluation panicked and was caught inside fixture")
}
func TestEvidenceValidCompileState(t *testing.T){
 c:=NewUncompiled(&openfgav1.Condition{Name:"synthetic-valid",Expression:"true"})
 for range 2{if e:=c.Compile();e!=nil{t.Fatal(e)}}
 result,e:=c.Evaluate(context.Background(),map[string]*structpb.Value{});if e!=nil||!result.ConditionMet{t.Fatal(result,e)}
 t.Log("valid expression compiles repeatedly and evaluates true")
}

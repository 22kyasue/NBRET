package types

import (
 "math"
 "testing"
)

// Observational representation contract, not an authorization bypass test.
// Criteria declared before execution: controls preserve10/reject fractions;
// record whether exact uint64 and decimal-string MaxUint64 agree.
func TestEvidenceNumericRepresentations(t *testing.T){
 small,err:=UIntParamType.ConvertValue("10");if err!=nil||small!=uint64(10){t.Fatal(small,err)}
 if _,err=UIntParamType.ConvertValue("10.5");err==nil{t.Fatal("fraction accepted")}
 if _,err=UIntParamType.ConvertValue("-10");err==nil{t.Fatal("negative accepted")}
 exact,err:=UIntParamType.ConvertValue(uint64(math.MaxUint64));if err!=nil||exact!=uint64(math.MaxUint64){t.Fatal(exact,err)}
 decimal,err:=UIntParamType.ConvertValue("18446744073709551615");if err!=nil{t.Fatal(err)}
 t.Logf("exact=%v decimal=%v equivalent=%v",exact,decimal,exact==decimal)
 if decimal!=uint64(math.MaxInt64){t.Fatalf("source prediction changed: %v",decimal)}
 signed,err:=IntParamType.ConvertValue("9223372036854775808");if err!=nil{t.Fatal(err)}
 if signed!=int64(math.MaxInt64){t.Fatalf("source prediction changed: %v",signed)}
 t.Log("out-of-signed-range string saturated without error; component observation only")
}

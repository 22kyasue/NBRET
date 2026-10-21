package sqlite
import (
 "context"
 "database/sql"
 "database/sql/driver"
 "errors"
 "io"
 "testing"
 "time"
 "github.com/openfga/openfga/pkg/storage"
 "github.com/openfga/openfga/pkg/storage/sqlcommon"
)
var evidenceStreamError=errors.New("synthetic terminal row error")
type evidenceDriver struct{}
type evidenceConn struct{mode string}
type evidenceRows struct{remaining int}
func(evidenceDriver)Open(name string)(driver.Conn,error){return &evidenceConn{name},nil}
func(c *evidenceConn)Prepare(string)(driver.Stmt,error){return nil,errors.New("not used")}
func(c *evidenceConn)Close()error{return nil}
func(c *evidenceConn)Begin()(driver.Tx,error){return nil,errors.New("not used")}
func(c *evidenceConn)QueryContext(context.Context,string,[]driver.NamedValue)(driver.Rows,error){
 if c.mode=="query-error"{return nil,evidenceStreamError};if c.mode=="prefix"{return &evidenceRows{1},nil};return &evidenceRows{0},nil
}
func(r *evidenceRows)Columns()[]string{return []string{"ulid","object_type","object_id","relation","user_object_type","user_object_id","user_relation","operation","condition_name","condition_context","inserted_at"}}
func(r *evidenceRows)Close()error{return nil}
func(r *evidenceRows)Next(out []driver.Value)error{
 if r.remaining==0{return evidenceStreamError};if r.remaining<0{return io.EOF};r.remaining--
 values:=[]driver.Value{"01HVMMBCMGZNT3SED4Z17ECXCA","document","synthetic","viewer","user","synthetic","",int64(0),nil,nil,time.Unix(100,0).UTC()};copy(out,values);return nil
}
func init(){sql.Register("research-synthetic-changelog",evidenceDriver{})}
// Criteria fixed before execution: query errors propagate; a terminal error with
// no rows maps to not-found; a terminal error after one row yields prefix/nil.
// This uses actual adapter with an inert database/sql driver, not a SQLite engine.
func TestEvidenceChangelogTerminalErrors(t *testing.T){
 for _,mode:=range []string{"query-error","empty","prefix"}{t.Run(mode,func(t *testing.T){
  db,err:=sql.Open("research-synthetic-changelog",mode);if err!=nil{t.Fatal(err)}
  ds,err:=NewWithDB(db,sqlcommon.NewConfig());if err!=nil{t.Fatal(err)};defer ds.Close()
  changes,token,err:=ds.ReadChanges(context.Background(),"synthetic-store",storage.ReadChangesFilter{},storage.ReadChangesOptions{})
  switch mode{
  case "query-error":if !errors.Is(err,evidenceStreamError){t.Fatal(changes,token,err)}
  case "empty":if !errors.Is(err,storage.ErrNotFound){t.Fatal(changes,token,err)}
  case "prefix":if err!=nil||len(changes)!=1||token==""{t.Fatal(changes,token,err)}
  }
  t.Logf("mode=%s changes=%d token=%q error=%v",mode,len(changes),token,err)
 })}
}

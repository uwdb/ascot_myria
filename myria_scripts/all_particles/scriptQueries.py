from raco.catalog import FromFileCatalog
import raco.myrial.parser as parser
import raco.myrial.interpreter as interpreter
import raco.algebra as alg
from raco.expression.expression import UnnamedAttributeRef


catalog = FromFileCatalog.load_from_file("vulcan.py")
_parser = parser.Parser()

#myrial statements not yet algebra
statement_list = _parser.parse("T1 = scan(public:vulcan:edgesConnected);store(T1, public:vulcan:edgesConnectedSort);")

processor = interpreter.StatementProcessor(catalog, True)

#goes through statement list and gets the logical plan (processor has it)
processor.evaluate(statement_list)

p = processor.get_logical_plan()

tail = p.args[0].input
p.args[0].input = alg.Shuffle(tail, [UnnamedAttributeRef(0), UnnamedAttributeRef(1), UnnamedAttributeRef(3)])


p = processor.get_physical_plan()

p = processor.get_json()

print p

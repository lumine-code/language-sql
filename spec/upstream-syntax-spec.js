describe("SQL upstream syntax regressions", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-sql");
    editor = await lumine.workspace.open("statements.sql");
  });

  afterEach(() => editor?.destroy());

  async function parse(text) {
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    return root;
  }

  for (const operation of ["UNION", "EXCEPT", "INTERSECT"]) {
    for (const modifier of ["ALL", "DISTINCT"]) {
      it(`parses ${operation} ${modifier} with both keyword scopes`, async () => {
        const text = `SELECT 1 ${operation} ${modifier} SELECT 2;\n`;
        const root = await parse(text);
        expect(root.descendantsOfType("set_operation").length).toBe(1);
        for (const [keyword, scope] of [
          [operation, "keyword.operator.word.sql"],
          [modifier, "keyword.control.sql"],
        ]) {
          expect(
            editor.scopeDescriptorForBufferPosition([0, text.indexOf(keyword)]).getScopesArray(),
          ).toContain(scope);
        }
      });
    }
  }

  it("parses table grants and revokes with keyword scopes", async () => {
    await parse(
      "GRANT SELECT ON TABLE public.items TO reader;\nREVOKE SELECT ON TABLE public.items FROM reader;\n",
    );
    for (const row of [0, 1]) {
      expect(editor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray()).toContain(
        "keyword.control.sql",
      );
    }
  });

  it("parses dollar identifiers, qualified DROP INDEX and scalar subquery comparisons", async () => {
    await parse(
      "SELECT price$usd FROM public.items WHERE value = (SELECT max(value) FROM public.items);\nDROP INDEX public.items_idx;\n",
    );
  });

  it("parses configuration clauses on functions and procedures", async () => {
    await parse(
      "CREATE FUNCTION f() RETURNS integer LANGUAGE SQL SET search_path TO public AS $$ SELECT 1; $$;\nCREATE PROCEDURE p() LANGUAGE SQL SET search_path TO public AS $$ SELECT 1; $$;\n",
    );
  });

  it("parses Hive array types and storage format keywords", async () => {
    await parse(
      "CREATE TABLE events (items ARRAY<STRING>) STORED AS INPUTFORMAT 'reader' OUTPUTFORMAT 'writer';\n",
    );
    const column = editor.lineTextForBufferRow(0).indexOf("INPUTFORMAT");
    expect(editor.scopeDescriptorForBufferPosition([0, column]).getScopesArray()).toContain(
      "keyword.control.sql",
    );
  });
});

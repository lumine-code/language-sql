describe("SQL upstream scanner regressions", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-sql");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.sql"));
  });

  afterEach(() => editor?.destroy());

  it("preserves separate named dollar quotes during incremental edits and undo", async () => {
    editor.setText(
      "CREATE PROCEDURE p() LANGUAGE SQL AS $body$ SELECT 1; $body$;\n" +
        "CREATE PROCEDURE q() LANGUAGE SQL AS $other$ SELECT 2; $other$;\n",
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    const rootNode = () => editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(rootNode().hasError).toBe(false);
    editor.getBuffer().clearUndoStack();
    const column = editor.lineTextForBufferRow(0).indexOf("1");
    editor.setTextInBufferRange(
      [
        [0, column],
        [0, column + 1],
      ],
      "10",
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(rootNode().hasError).toBe(false);
    editor.undo();
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(rootNode().hasError).toBe(false);
    expect(rootNode().descendantsOfType("create_procedure").length).toBe(2);
  });
});

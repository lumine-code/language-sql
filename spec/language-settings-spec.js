describe("language-sql editing defaults", () => {
  let editor;
  beforeEach(async () => {
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-source");
    await lumine.packages.activatePackage("language-sql");

    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.sql"));
    editor.setText("SELECT value FROM records;");
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  it("uses the correct comment operation in source.sql", async () => {
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.sql"));
    editor.setText("SELECT value FROM records;");
    await editor.whenGrammarSettled();
    await editor.toggleLineCommentsForBufferRows(0, editor.getLastBufferRow());
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(0)).toBe("-- SELECT value FROM records;");
    await editor.toggleLineCommentsForBufferRows(0, editor.getLastBufferRow());
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe("SELECT value FROM records;");
  });

  it("provides real block delimiters to snippet and comment consumers", async () => {
    const delimiters = await editor.getCommentDelimitersForBufferPosition([0, 0]);
    expect(delimiters.block).toEqual(["/*", "*/"]);
    expect(delimiters.line).toBe("--");
  });
});

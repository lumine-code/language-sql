describe("SQL numeric literal highlights in native editors", () => {
  let editor;

  beforeEach(async () => {
    for (const method of ["openExternal", "openPath", "showItemInFolder", "openApplication"])
      spyOn(lumine.shell, method).and.returnValue(Promise.resolve());
    spyOn(lumine.application, "openWindow").and.returnValue(Promise.resolve());
    await lumine.packages.activatePackage("language-sql");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.sql"));
  });

  afterEach(() => editor?.destroy());

  async function scopesFor(literal) {
    editor.setText(`SELECT ${literal};`);
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );
    return editor.scopeDescriptorForBufferPosition([0, 7]).getScopesArray();
  }

  it("highlights an integer as a numeric constant", async () => {
    expect(await scopesFor("42")).toContain("constant.numeric.sql");
  });

  it("highlights a decimal as a floating point constant", async () => {
    expect(await scopesFor("12.5")).toContain("constant.numeric.float.sql");
  });

  it("keeps quoted digits in the string scope", async () => {
    const scopes = await scopesFor("'42'");
    expect(scopes).toContain("string.quoted.double.sql");
    expect(scopes).not.toContain("constant.numeric.sql");
    expect(scopes).not.toContain("constant.numeric.float.sql");
  });
});

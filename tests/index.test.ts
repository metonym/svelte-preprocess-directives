import type { Processed } from "svelte/types/compiler/preprocess";
import { describe, expect, test } from "vitest";
import * as API from "../src";

describe("API", () => {
  test("Library exports", () => {
    expect(Object.keys(API)).toMatchInlineSnapshot(`
      [
        "componentDirectives",
      ]
    `);
  });
});

const preprocess = (content: string) =>
  (API.componentDirectives().markup?.({ content }) as Processed).code;

describe("Class directives", () => {
  test("No attributes", () => {
    expect(preprocess(`<Component />`)).toMatchInlineSnapshot(
      '"<Component />"'
    );
  });

  test("No attributes with children", () => {
    expect(preprocess(`<Component>Row 1\nRow 2</Component>`))
      .toMatchInlineSnapshot(`
        "<Component>Row 1
        Row 2</Component>"
      `);
  });

  test("Non-class attributes", () => {
    expect(
      preprocess(`<Component id="my-id" data-id={false} />`)
    ).toMatchInlineSnapshot('"<Component id=\\"my-id\\" data-id={false} />"');
  });

  test("Class attribute", () => {
    expect(preprocess(`<Component class="a" />`)).toMatchInlineSnapshot(
      '"<Component class=\\"a\\" />"'
    );
  });

  test("Empty class attribute", () => {
    expect(preprocess(`<Component class="" />`)).toMatchInlineSnapshot(
      '"<Component />"'
    );
  });

  test("Class attribute and directive", () => {
    expect(
      preprocess(`<Component class="a" class:a={true} />`)
    ).toMatchInlineSnapshot('"<Component class=\\"a {true && \\"a\\"}\\" />"');
  });

  test("Class directive", () => {
    expect(preprocess(`<Component class:a={true} />`)).toMatchInlineSnapshot(
      '"<Component class=\\"{true && \\"a\\"}\\" />"'
    );
  });

  test("Class directive – shorthand", () => {
    expect(preprocess(`<Component class:a />`)).toMatchInlineSnapshot(
      '"<Component class=\\"{a && \\"a\\"}\\" />"'
    );
  });

  test("Multiple class directives", () => {
    expect(
      preprocess(`<Component class:a={true} class:b={0 === 0} />`)
    ).toMatchInlineSnapshot(
      '"<Component class=\\"{true && \\"a\\"} {0 === 0 && \\"b\\"}\\" />"'
    );
  });

  test("Non-class attributes and class directives", () => {
    expect(
      preprocess(
        `<Component id="my-id" class:a={true} class:b={0 === 0}>Content</Component>`
      )
    ).toMatchInlineSnapshot(
      '"<Componentid=\\"my-id\\" class=\\"{true && \\"a\\"} {0 === 0 && \\"b\\"}\\">Content</Component>"'
    );
  });
});

describe("Style directives", () => {
  test("Empty style", () => {
    expect(preprocess(`<Component style="" />`)).toMatchInlineSnapshot(
      '"<Component style=\\"\\" />"'
    );
  });

  test("Style attribute with single rule", () => {
    expect(
      preprocess(`<Component style="color: red;" />`)
    ).toMatchInlineSnapshot('"<Component style=\\"color: red\\" />"');
  });

  test("Style attribute with style directive", () => {
    expect(
      preprocess(`<Component style="color: red;" style:color="red" />`)
    ).toMatchInlineSnapshot('"<Component style=\\"color: red\\" />"');
  });

  test("Style directive", () => {
    expect(preprocess(`<Component style:color="red" />`)).toMatchInlineSnapshot(
      '"<Component style=\\"color: red\\" />"'
    );
  });

  test("Style directive – shorthand", () => {
    expect(preprocess(`<Component style:color />`)).toMatchInlineSnapshot(
      '"<Component style=\\"color: {color}\\" />"'
    );
  });

  test("Style directive – shorthand with modifier", () => {
    expect(
      preprocess(`<Component style:color|important />`)
    ).toMatchInlineSnapshot(
      '"<Component style=\\"color: {color} !important\\" />"'
    );
  });

  test("Multiple style directives", () => {
    expect(
      preprocess(
        `<Component style:color="red" style:background-color={darkMode ? "black" : "white"} style:font|important={value} />`
      )
    ).toMatchInlineSnapshot(
      '"<Component style=\\"color: red; background-color: {darkMode ? \\"black\\" : \\"white\\"}; font: {value} !important\\" />"'
    );
  });
});

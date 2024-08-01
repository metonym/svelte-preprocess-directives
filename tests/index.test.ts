import type { Processed } from "svelte/types/compiler/preprocess";
import * as API from "../src";

describe("API", () => {
  test("Library exports", () => {
    expect(Object.keys(API)).toEqual(["componentDirectives"]);
  });
});

const preprocess = (content: string) =>
  (API.componentDirectives().markup?.({ content }) as Processed).code;

describe("Class directives", () => {
  test("No attributes", () => {
    expect(preprocess(`<Component />`)).toEqual("<Component />");
  });

  test("No attributes with children", () => {
    expect(preprocess(`<Component>Row 1\nRow 2</Component>`)).toEqual(
      `<Component>Row 1\nRow 2</Component>`
    );
  });

  test("Non-class attributes", () => {
    expect(preprocess(`<Component id="my-id" data-id={false} />`)).toEqual(
      '<Component id="my-id" data-id={false} />'
    );
  });

  test("Class attribute", () => {
    expect(preprocess(`<Component class="a" />`)).toEqual(
      '<Component class="a" />'
    );
  });

  test("Empty class attribute", () => {
    expect(preprocess(`<Component class="" />`)).toEqual("<Component />");
  });

  test("Class attribute and directive", () => {
    expect(preprocess(`<Component class="a" class:a={true} />`)).toEqual(
      '<Component class="a {true && "a"}" />'
    );
  });

  test("Class directive", () => {
    expect(preprocess(`<Component class:a={true} />`)).toEqual(
      '<Component class="{true && "a"}" />'
    );
  });

  test("Class directive – shorthand", () => {
    expect(preprocess(`<Component class:a />`)).toEqual(
      '<Component class="{a && "a"}" />'
    );
  });

  test("Multiple class directives", () => {
    expect(
      preprocess(`<Component class:a={true} class:b={0 === 0} />`)
    ).toEqual('<Component class="{true && "a"} {0 === 0 && "b"}" />');
  });

  test("Non-class attributes and class directives", () => {
    expect(
      preprocess(
        `<Component id="my-id" class:a={true} class:b={0 === 0}>Content</Component>`
      )
    ).toEqual(
      '<Componentid="my-id" class="{true && "a"} {0 === 0 && "b"}">Content</Component>'
    );
  });
});

describe("Style directives", () => {
  test("Empty style", () => {
    expect(preprocess(`<Component style="" />`)).toEqual(
      '<Component style="" />'
    );
  });

  test("Style attribute with single rule", () => {
    expect(preprocess(`<Component style="color: red;" />`)).toEqual(
      '<Component style="color: red" />'
    );
  });

  test("Style attribute with style directive", () => {
    expect(
      preprocess(`<Component style="color: red;" style:color="red" />`)
    ).toEqual('<Component style="color: red" />');
  });

  test("Style directive", () => {
    expect(preprocess(`<Component style:color="red" />`)).toEqual(
      '<Component style="color: red" />'
    );
  });

  test("Style directive – shorthand", () => {
    expect(preprocess(`<Component style:color />`)).toEqual(
      '<Component style="color: {color}" />'
    );
  });

  test("Style directive – shorthand with modifier", () => {
    expect(preprocess(`<Component style:color|important />`)).toEqual(
      '<Component style="color: {color} !important" />'
    );
  });

  test("Multiple style directives", () => {
    expect(
      preprocess(
        `<Component style:color="red" style:background-color={darkMode ? "black" : "white"} style:font|important={value} />`
      )
    ).toEqual(
      '<Component style="color: red; background-color: {darkMode ? "black" : "white"}; font: {value} !important" />'
    );
  });
});

import MagicString from "magic-string";
import { parse, type SveltePreprocessor } from 'svelte/compiler';
import { AST, walk } from 'estree-walker';

export const componentDirectives: SveltePreprocessor<"markup"> = () => {
  return {
    markup({ content, filename }) {
      if (filename && /node_modules/.test(filename)) return;

      const ast = parse(content);
      const s = new MagicString(content);
      const slice = (node: AST.Element) => content.slice(node.start, node.end);

      walk(ast, {
        enter(node) {
          if (node.type === "InlineComponent") {
            const classes = new Map();
            const styles = new Map();

            const attributes = node.attributes.filter((attribute: AST.Attribute) => {
              const { name, value, type, expression, modifiers } = attribute;

              if (name === "class") {
                classes.set(name, slice(value[0]));
                return false;
              }

              if (type === "Class") {
                classes.set(name, slice(expression));
                return false;
              }

              if (name === "style") {
                const [property, propertyValue] = value[0]?.data.split(":");

                if (property && propertyValue) {
                  styles.set(property, propertyValue.trim().replace(/\;$/, ""));
                }

                return false;
              }

              if (type === "StyleDirective") {
                const is_important = modifiers.some(
                  (modifier: string) => modifier === "important"
                );
                const important_modifier = is_important ? " !important" : "";

                if (Array.isArray(value)) {
                  styles.set(name, slice(value[0]) + important_modifier);
                } else if (value === true) {
                  styles.set(name, `{${name}}${important_modifier}`);
                }

                return false;
              }

              return true;
            });

            if (classes.size === 0 && styles.size === 0) return;

            const attributes_string = attributes.map(slice).join(" ");
            const children = node.children?.[0] ? slice(node.children[0]) : "";

            const class_string = [...classes]
              .map(([key, value]) => {
                if (key === "class") return value;
                return `{${value} && "${key}"}`;
              })
              .join(" ");
            const style_string = [...styles]
              .map(([key, value]) => `${key}: ${value}`)
              .join("; ");

            const template = [
              `<${node.name}`,
              attributes_string,
              class_string && ` class="${class_string}"`,
              style_string && ` style="${style_string}"`,
              children && `>${children}</${node.name}>`,
              !children && " />",
            ]
              .filter(Boolean)
              .join("");

            s.overwrite(node.start, node.end, template);
          }
        },
      });

      return {
        code: s.toString(),
        map: s.generateMap({
          source: filename,
          hires: true,
        }),
      };
    },
  };
};

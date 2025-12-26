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
          /**
           * Process inline component nodes
           * @example
           * <MyComponent class="foo" style:color="red" />
           */
          if (node.type === "InlineComponent") {
            const classes = new Map();
            const styles = new Map();

            const attributes = node.attributes.filter((attribute: AST.Attribute) => {
              const { name, value, type, expression, modifiers } = attribute;

              /**
               * Handle static class attribute
               * @example
               * <Component class="foo bar" />
               */
              if (name === "class") {
                classes.set(name, slice(value[0]));
                return false;
              }

              /**
               * Handle class directive (class:name={expr})
               * @example
               * <Component class:active={isActive} />
               */
              if (type === "Class") {
                classes.set(name, slice(expression));
                return false;
              }

              /**
               * Handle static style attribute
               * @example
               * <Component style="color: red; font-size: 16px" />
               */
              if (name === "style") {
                const [property, propertyValue] = value[0]?.data.split(":");

                /**
                 * Parse style property and value from style string
                 * @example
                 * style="color: red" -> property="color", propertyValue=" red"
                 */
                if (property && propertyValue) {
                  styles.set(property, propertyValue.trim().replace(/\;$/, ""));
                }

                return false;
              }

              /**
               * Handle style directive (style:property="value" or style:property={expr})
               * @example
               * <Component style:color="red" />
               * <Component style:color={colorVar} />
               */
              if (type === "StyleDirective") {
                /**
                 * Handle important modifier in style directive
                 * @example
                 * <Component style:color|important="red" />
                 */
                const is_important = modifiers.some(
                  (modifier: string) => modifier === "important"
                );
                const important_modifier = is_important ? " !important" : "";

                /**
                 * Handle style directive with expression value
                 * @example
                 * <Component style:color={colorVar} />
                 */
                if (Array.isArray(value)) {
                  styles.set(name, slice(value[0]) + important_modifier);
                } 
                /**
                 * Handle style directive shorthand (value === true)
                 * @example
                 * <Component style:color />
                 */
                else if (value === true) {
                  styles.set(name, `{${name}}${important_modifier}`);
                }

                return false;
              }

              /**
               * Keep all other attributes (not class/style related)
               * @example
               * <Component id="foo" data-test="bar" />
               */
              return true;
            });

            /**
             * Skip transformation if no classes or styles to process
             * @example
             * <Component id="foo" /> (no classes or styles)
             */
            if (classes.size === 0 && styles.size === 0) return;

            const attributes_string = attributes.map(slice).join(" ");
            /**
             * Handle components with or without children
             * @example
             * <Component>content</Component> vs <Component />
             */
            const children = node.children?.[0] ? slice(node.children[0]) : "";

            const class_string = [...classes]
              .map(([key, value]) => {
                /**
                 * Transform static class attribute
                 * @example
                 * class="foo" -> "foo"
                 */
                if (key === "class") return value;
                /**
                 * Transform conditional class directive
                 * @example
                 * class:active={isActive} -> "{isActive && \"active\"}"
                 */
                return `{${value} && "${key}"}`;
              })
              .join(" ");
            const style_string = [...styles]
              .map(([key, value]) => `${key}: ${value}`)
              .join("; ");

            /**
             * Build template with class, style, and children
             * @example
             * class_string = "foo {isActive && \"active\"}"
             * style_string = "color: red; font-size: 16px"
             * <Component>content</Component>
             * <Component />
             */
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

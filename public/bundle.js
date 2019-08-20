
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/element.svelte generated by Svelte v3.8.1 */

    const file = "src/element.svelte";

    const get_title_slot_changes = () => ({});
    const get_title_slot_context = () => ({});

    const get_checked_slot_changes = () => ({});
    const get_checked_slot_context = () => ({});

    function create_fragment(ctx) {
    	var div1, div0, t, current;

    	const checked_slot_template = ctx.$$slots.checked;
    	const checked_slot = create_slot(checked_slot_template, ctx, get_checked_slot_context);

    	const title_slot_template = ctx.$$slots.title;
    	const title_slot = create_slot(title_slot_template, ctx, get_title_slot_context);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			if (checked_slot) checked_slot.c();
    			t = space();

    			if (title_slot) title_slot.c();

    			attr(div0, "class", "element__title svelte-1xah7yu");
    			add_location(div0, file, 14, 2, 225);
    			attr(div1, "class", "element__container svelte-1xah7yu");
    			add_location(div1, file, 13, 0, 190);
    		},

    		l: function claim(nodes) {
    			if (checked_slot) checked_slot.l(div0_nodes);

    			if (title_slot) title_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			if (checked_slot) {
    				checked_slot.m(div0, null);
    			}

    			append(div0, t);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (checked_slot && checked_slot.p && changed.$$scope) {
    				checked_slot.p(
    					get_slot_changes(checked_slot_template, ctx, changed, get_checked_slot_changes),
    					get_slot_context(checked_slot_template, ctx, get_checked_slot_context)
    				);
    			}

    			if (title_slot && title_slot.p && changed.$$scope) {
    				title_slot.p(
    					get_slot_changes(title_slot_template, ctx, changed, get_title_slot_changes),
    					get_slot_context(title_slot_template, ctx, get_title_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(checked_slot, local);
    			transition_in(title_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(checked_slot, local);
    			transition_out(title_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (checked_slot) checked_slot.d(detaching);

    			if (title_slot) title_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Element extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/app.svelte generated by Svelte v3.8.1 */

    const file$1 = "src/app.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (31:4) 
    function create_checked_slot(ctx) {
    	var input, input_checked_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "slot", "checked");
    			attr(input, "type", "checkbox");
    			input.checked = input_checked_value = ctx.item.checked;
    			add_location(input, file$1, 30, 4, 588);
    			dispose = listen(input, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			dispose();
    		}
    	};
    }

    // (32:4) <span slot="title">
    function create_title_slot(ctx) {
    	var span, t_value = ctx.item.title + "", t;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "slot", "title");
    			add_location(span, file$1, 31, 4, 692);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    // (30:2) <Element>
    function create_default_slot(ctx) {
    	var t0, t1;

    	return {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    			}
    		}
    	};
    }

    // (29:2) {#each items as item (item.id) }
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var element_1 = new Element({
    		props: {
    		$$slots: {
    		default: [create_default_slot],
    		title: [create_title_slot],
    		checked: [create_checked_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			element_1.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(element_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var element_1_changes = {};
    			if (changed.$$scope) element_1_changes.$$scope = { changed, ctx };
    			element_1.$set(element_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(element_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(element_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			destroy_component(element_1, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.items;

    	const get_key = ctx => ctx.item.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(div, "class", "container__todo svelte-1k5uke1");
    			add_location(div, file$1, 27, 0, 507);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.items;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    function instance$1($$self) {
    	const items = [
        { id: 1, title: 'first', checked: false },
        { id: 2, title: 'second', checked: false }
      ];

      function checkedItem(id) {
        const item = items.find(item => item.id === id);
        if (!item) {
          return
        }
      }

    	function click_handler({ item }) {
    		return checkedItem(item.id);
    	}

    	return { items, checkedItem, click_handler };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

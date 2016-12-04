/**
 * @class Ext.ux.grid.column.ActionButtonColumn
 * @extends Ext.grid.column.Column
 * @version 0.5
 * @author Lucian Lature (lucian.lature@gmail.com)
 * @author Kathrn Reeve (k.reeve@ctidigital.com)
 *
 * <p>A Grid header type which renders a button, or a series of buttons in a grid cell, and offers a scoped click
 * handler for each button.</p>
 *
 * {@img Ext.ux.grid.column.ActionButtonColumn/Ext.ux.grid.column.ActionButtonColumn.png Ext.ux.grid.column.ActionButtonColumn grid column}
 *
 * ## Code
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'senority', 'dep', 'hired'],
 *         data:[
 *             {firstname:"Michael", lastname:"Scott", hideEdit: true, iconFire: 'fire2'},
 *             {firstname:"Dwight", lastname:"Schrute"},
 *             {firstname:"Jim", lastname:"Halpert", hideFire: true, iconEdit: 'edit2'},
 *             {firstname:"Kevin", lastname:"Malone"},
 *             {firstname:"Angela", lastname:"Martin"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Action Button Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {
 *                 xtype:'actionbuttoncolumn',
 *                 width:200,
 *                 header: 'Actions',
 *                 items: [{
 *                     text: 'Edit',
 *                     iconIndex: 'iconFire',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Edit " + rec.get('firstname'));
 *                     }
 *                 },{
 *                     text: 'Fire',
 *                     hideIndex: 'hideEdit',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Fire " + rec.get('firstname'));
 *                     }
 *                 },{
 *                     text: 'Schedule Meeting',
 *                     eventName: 'scheduleMeeting'
 *                 }]
 *             }
 *         ],
 *         width: 450,
 *         renderTo: Ext.getBody()
 *     });
 * <p>The action button column can be at any index in the columns array, and a grid can have any number of
 * action columns. </p>
 * @xtype actionbuttoncolumn
 */

Ext.define('Ext.ux.ActionButtonColumn', {

    extend: 'Ext.grid.column.Column',
    alias: ['widget.actionbuttoncolumn'],
    alternateClassName: 'Ext.grid.ActionButtonColumn',

    header: '&#160;',

    sortable: false,
    btns: [],
    constructor: function(config) {

        var me = this,
        cfg = Ext.apply({}, config),
        items = cfg.items || [me],
        l = items.length,
        i,
        item;
        me.btns = new Ext.util.MixedCollection();
        // This is a Container. Delete the items config to be reinstated after construction.
        delete cfg.items;
        me.callParent([cfg]);

        // Items is an array property of ActionButtonColumns
        me.items = items;
        var gv = '';

        // Renderer closure iterates through items creating a button element for each and tagging with an identifying
        me.renderer = function(v, meta, rec, rowIndex, colIndex, store, view) {

            if (gv === '') {
                gv = view;

                var evnts = {
                    'actionbuttonclick':true
                };

                Ext.Array.each(items, function(btn) {
                    if (btn.handler) { }
                    else if (btn.eventName) {
                        evnts[btn.eventName] = true;
                    } else if (btn.cls) {
                        var evntName = btn.cls.replace(/[^a-zA-Z]/,'')+'click';
                        evnts[evntName]=true;
                    }
                });
                view.addEvents(evnts);
            }

            //  Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';

            meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';

            for (i = 0; i < l; i++) {

                item = items[i];

                var nid = Ext.id();
                var cls = Ext.baseCSSPrefix + 'action-col-button ' + Ext.baseCSSPrefix + 'action-col-button-' + String(i)+(item.cls ? ' '+item.cls : '');
                var iconCls = item.iconIndex ? rec.data[item.iconIndex] : (item.iconCls ? item.iconCls : '');
                var fun = Ext.emptyFn;
                var context = me;
                if (item.handler) {
                    if (item.context) {
                        context = item.context;
                    }
                    fun = Ext.bind(item.handler, context, [view, rowIndex, colIndex]);
                }
                else {
                    (function(item) {
                        var eventName = 'actionbuttonclick';
                        if (typeof item.eventName != 'undefined') {
                            eventName = item.eventName;
                        } else if (typeof item.cls != 'undefined') {
                            eventName = item.cls.replace(/[^a-zA-Z]/,'')+'click';
                        }
                        fun = function() {
                            if (eventName != 'actionbuttonclick') {
                                view.fireEvent('actionbuttonclick', this, view, rowIndex, colIndex);
                            }
                            view.fireEvent(eventName, view, rowIndex, colIndex);
                        };

                    })(item);
                }
                var hide;
                if (typeof item.showIndex != 'undefined') {
                    hide = !rec.data[item.showIndex];
                } else if (typeof item.hideIndex != 'undefined') {
                    hide = rec.data[item.hideIndex];
                }

                Ext.Function.defer(me.createGridButton, 100, me, [item.text, nid, rec, cls, fun, hide, iconCls]);

                v += '<div id="' + nid + '">&#160;</div>';
            }
            return v;
        };
    },

    createGridButton: function(value, id, record, cls, fn, hide, iconCls) {
        var target = Ext.get(id);
        if (target !== null) {
            var btn = new Ext.Button({
                text: value,
                cls: cls,
                iconCls: iconCls,
                hidden: hide,
                handler: fn,
                renderTo: target.parent()
            });
            this.btns.add(btn);
            Ext.get(id).remove();
        }
    },

    destroy: function() {
        delete this.items;
        delete this.renderer;
        this.btns.each(function(btn){
            btn.destroy();
        });
        return this.callParent(arguments);
    },

    cascade: function(fn, scope) {
        fn.call(scope||this, this);
    },

    // Private override because this cannot function as a Container, and it has an items property which is an Array,
    // NOT a MixedCollection.
    getRefItems: function() {
        return [];
    }
});
'use strict';

describe('Tree.getSelectedNodes', function() {
    var $tree;
    var tree;

    before(function() {
        helpers.createTreeContainer();

        // Query DOM
        $tree = $('.tree');

        // Create tree
        tree = new InspireTree({
            target: $tree,
            data: [{
                text: 'A',
                id: 1
            }]
        });
    });

    it('exists', function() {
        expect(tree.getSelectedNodes).to.be.a('function');
    });

    it('returns an empty array when none selected', function() {
        expect(tree.getSelectedNodes()).to.have.length(0);
    });

    it('returns select root node', function() {
        tree.getNode(1).select();

        expect(tree.getSelectedNodes()).to.have.length(1);
    });

    after(helpers.clearDOM);
});

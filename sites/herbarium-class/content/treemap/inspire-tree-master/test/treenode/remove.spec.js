'use strict';

describe('TreeNode.prototype.remove', function() {
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
        expect(tree.getNode(1).remove).to.be.a('function');
    });

    it('removes a node', function() {
        tree.getNode(1).remove();

        expect(tree.getNodes()).to.have.length(0);
    });

    after(helpers.clearDOM);
});

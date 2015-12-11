'use strict';

describe('TreeNode.prototype.set', function() {
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
        expect(tree.getNode(1).set).to.be.a('function');
    });

    it('updates node property', function() {
        var node = tree.getNode(1);
        expect(node.itree.dirty).to.be.false;
        expect(node.text).to.equal('A');

        node.set('text', 'New');
        expect(node.itree.dirty).to.be.true;
        expect(node.text).to.equal('New');
    });

    after(helpers.clearDOM);
});

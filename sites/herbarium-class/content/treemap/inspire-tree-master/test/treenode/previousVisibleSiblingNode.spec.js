'use strict';

describe('TreeNode.prototype.previousVisibleSiblingNode', function() {
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
            }, {
                text: 'B',
                id: 2
            }]
        });
    });

    it('exists', function() {
        expect(tree.getNode(1).previousVisibleSiblingNode).to.be.a('function');
    });

    it('returns first node', function() {
        expect(tree.getNode(2).previousVisibleSiblingNode().id).to.equal('1');
    });

    it('returns undefined when first node hidden', function() {
        tree.getNode(1).hide();
        expect(tree.getNode(2).previousVisibleSiblingNode()).to.be.undefined;
    });

    after(helpers.clearDOM);
});

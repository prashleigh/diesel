'use strict';

describe('TreeNode.prototype.recurseUp', function() {
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
                id: 1,
                children: [{
                    text: 'AA',
                    id: 2,
                    children: [{
                        text: 'AAA',
                        id: 3
                    }]
                }]
            }]
        });
    });

    it('exists', function() {
        expect(tree.getNode(1).recurseUp).to.be.a('function');
    });

    it('recurse up self and all parents', function() {
        var count = 0;

        tree.getNode(3).recurseUp(function(node) {
            count++;
            return node;
        });

        expect(count).to.equal(3);
    });

    after(helpers.clearDOM);
});

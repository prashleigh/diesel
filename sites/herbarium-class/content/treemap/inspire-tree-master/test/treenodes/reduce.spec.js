'use strict';

describe('TreeNodes.prototype.reduce', function() {
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
                    text: 'B',
                    company: 'Test'
                }]
            }, {
                text: 'C',
                company: 'Test'
            }]
        });
    });

    it('exists', function() {
        expect(tree.getNodes().reduce).to.be.a('function');
    });

    it('returns only reduced nodes', function() {
        expect(tree.getNodes().reduce(function(node) {
            return (node.company === 'Test');
        })).to.have.length(1);
    });

    after(helpers.clearDOM);
});

const NODE_R = 8;
const DEFAULT_URL = 'https://raw.githubusercontent.com/vasturiano/force-graph/master/example/datasets/miserables.json';

window.addEventListener('DOMContentLoaded', (event) => {
    const searchBar = document.querySelector('.searchbar');

    fetch(DEFAULT_URL).then(res => res.json()).then(data => {
        const edges = {};
        data.links.forEach(link => {
            edges[link.source] = edges[link.source] || {};
            edges[link.source][link.target] = true;

            edges[link.target] = edges[link.target] || {};
            edges[link.target][link.source] = true;
        });

        let searchedNode = null;
        const highlightNodes = new Set();

        const Graph = ForceGraph()
        (document.getElementById('graph'))
            .graphData(data)
            .nodeId('id')
            .nodeVal('val')
            .nodeLabel('id')
            .nodeAutoColorBy('group')
            .linkSource('source')
            .linkTarget('target')
            .nodeCanvasObjectMode(node => highlightNodes.has(node) ? 'after' : null)
            .nodeCanvasObject((node, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 12 / globalScale;

                // add ring just for highlighted nodes
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_R / 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.id === searchedNode ? 'red' : 'orange';
                ctx.fill();

                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                ctx.fillStyle = 'rgba(0, 0, 0)';
                // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillText(label, node.x, node.y);
            })
        searchBar.addEventListener('change', event => {
            searchedNode = event.target.value;
            highlightNodes.clear();
            Graph.zoomToFit(1000, 100, (node) => {
                const isTarget = (node.id === event.target.value);
                const isNeighbor = edges[event.target.value][node.id];
                if (isTarget || isNeighbor) {
                    highlightNodes.add(node);
                }
                return isTarget || isNeighbor;
            });
        });
    });
});

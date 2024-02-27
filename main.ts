import wordlist from "wordlist-english";
import { Graph, Direction } from "./Graph.ts";

type WordGraphKey = string | SpecialNode;

enum SpecialNode {
    Start = 1,
    End = 2,
}

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
const dictionarySet = new Set(dictionary);
console.log(`Dictionary length: ${dictionary.length}`);
const wordGraph = makeWordGraph(dictionary);
console.log(`Graph nodes: ${wordGraph.getNodes().length}`);

const startConnectedNodes = findConnectedNodes(
    wordGraph,
    [SpecialNode.Start],
    Direction.Forward
);
console.log(`Start-connected nodes: ${startConnectedNodes.size}`);
const endConnectedNodes = findConnectedNodes(
    wordGraph,
    [SpecialNode.End],
    Direction.Backward
);
console.log(`End-connected nodes: ${endConnectedNodes.size}`);
const biconnectedNodes = [...startConnectedNodes.keys()].filter((node) =>
    endConnectedNodes.has(node)
);
console.log(`biconnected nodes: ${biconnectedNodes.length}`);

const filteredGraph = wordGraph.makeFilteredGraph(new Set(biconnectedNodes));

let longestPath: WordGraphKey[] = [];
for (let i = 0; i < 1000000; i++) {
    let currentNode: WordGraphKey = SpecialNode.Start;
    const path: WordGraphKey[] = [currentNode];
    while (currentNode !== SpecialNode.End) {
        const nextNodes: WordGraphKey[] = [
            ...filteredGraph.getNext(currentNode),
        ];
        currentNode = nextNodes[Math.floor(Math.random() * nextNodes.length)];
        path.push(currentNode);
    }
    if (
        new Set(path).size === path.length &&
        path.length > longestPath.length
    ) {
        longestPath = path;
    }
}
console.log(longestPath);

async function loadSettings(settingsFile: string): Promise<Settings> {
    const defaultSettings: Settings = {
        dictionary: "english/10",
        minOverlap: 2,
    };
    const settingsFileText = await Deno.readTextFile(settingsFile);
    const fileSettings: Partial<Settings> = JSON.parse(settingsFileText);
    return { ...defaultSettings, ...fileSettings };
}

interface Settings {
    dictionary: string;
    minOverlap: number;
}

function getDictionary(): string[] {
    const words: string[] = wordlist[settings.dictionary];
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

// function getStartWords(dictionary: string[]): string[] {
//     return dictionary.filter((word: string, index: number) =>
//         dictionary[index + 1]?.startsWith(word)
//     );
// }

function makeWordGraph(dictionary: string[]): Graph<WordGraphKey, undefined> {
    const wordGraph = new Graph<WordGraphKey, undefined>();
    for (const word of dictionary) {
        for (
            let i = settings.minOverlap;
            i < word.length - settings.minOverlap;
            i++
        ) {
            const startFragment = word.slice(0, i);
            const endFragment = word.slice(i);
            wordGraph.addEdgeAndEndpoints(
                startFragment,
                endFragment,
                undefined,
                undefined
            );
        }
    }

    const terminalNodes = wordGraph
        .getNodes()
        .filter((node) => dictionarySet.has(node as string));
    console.log(`Terminal nodes: ${terminalNodes.length}`);

    for (const terminalNode of terminalNodes) {
        wordGraph.addEdgeAndEndpoints(
            SpecialNode.Start,
            terminalNode,
            undefined,
            undefined
        );
        wordGraph.addEdgeAndEndpoints(
            terminalNode,
            SpecialNode.End,
            undefined,
            undefined
        );
    }

    return wordGraph;
}

function findConnectedNodes<T>(
    graph: Graph<T, unknown>,
    startNodes: T[],
    direction: Direction
): Set<T> {
    const visitedNodes = new Set(startNodes);
    const nodeStack = [...startNodes];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack.pop()!;
        const nextNodes = graph.getAdjacent(currentNode, direction);
        nextNodes?.forEach((nextNode) => {
            if (!visitedNodes.has(nextNode)) {
                nodeStack.push(nextNode);
                visitedNodes.add(nextNode);
            }
        });
    }
    return visitedNodes;
}

import wordlist from "wordlist-english";
import { Graph, Direction } from "./Graph.ts";

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
console.log(`Dictionary length: ${dictionary.length}`);
const wordGraph = makeWordGraph(dictionary);
console.log(`Graph nodes: ${wordGraph.getNodes().length}`);
const dictionarySet = new Set(dictionary);
const terminalNodes = wordGraph
    .getNodes()
    .filter((node) => dictionarySet.has(node));
console.log(`Terminal nodes: ${terminalNodes.length}`);
const startConnectedNodes = findConnectedNodes(
    wordGraph,
    terminalNodes,
    Direction.Forward
);
console.log(`Start-connected nodes: ${startConnectedNodes.size}`);

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

function makeWordGraph(dictionary: string[]): Graph<string> {
    const wordGraph = new Graph<string>();
    for (const word of dictionary) {
        for (
            let i = settings.minOverlap;
            i < word.length - settings.minOverlap;
            i++
        ) {
            const startFragment = word.slice(0, i);
            const endFragment = word.slice(i);
            wordGraph.addEdge(startFragment, endFragment);
        }
    }
    return wordGraph;
}

function findConnectedNodes<T>(
    graph: Graph<T>,
    startNodes: T[],
    direction: Direction
): Set<T> {
    const visitedNodes = new Set(startNodes);
    const nodeStack = startNodes;
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

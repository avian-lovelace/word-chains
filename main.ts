import wordlist from "wordlist-english";

const words: string[] = wordlist["english/10"];
const onlyLettersRegex = /^[a-z]+$/;
const filteredWords = wordlist.filter((word: string) =>
    onlyLettersRegex.test(word)
);
filteredWords.sort();

const start = words[Math.floor(Math.random() * words.length)];

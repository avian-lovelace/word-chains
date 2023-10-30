import wordlist from 'wordlist-english';

if (import.meta.main) {
  console.log(wordlist['english/10'].slice(0, 100));
}

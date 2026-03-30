import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Web3GPT SDK</h1>
        <ol>
          <li>Create a chat with no params.</li>
          <li>
            Persist the returned <code>chatId</code>.
          </li>
          <li>Continue the same thread with more messages.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://w3gpt.ai/skill.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Skill guide
          </a>
          <a
            href="https://w3gpt.ai/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            API reference
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://www.npmjs.com/package/w3gpt"
          target="_blank"
          rel="noopener noreferrer"
        >
          NPM package
        </a>
        <a
          href="https://github.com/Markeljan/web3gpt"
          target="_blank"
          rel="noopener noreferrer"
        >
          Main app repo
        </a>
      </footer>
    </div>
  );
}

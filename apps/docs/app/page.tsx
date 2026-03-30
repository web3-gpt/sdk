import styles from "./page.module.css";

const installSnippet = `npm install w3gpt`;

const quickstartSnippet = `import { w3gpt } from "w3gpt";

const client = w3gpt();

const started = await client.startChat();

const reply = await client.chat({
  chatId: started.chatId,
  message: "Deploy an ERC20 on Polygon mainnet with 1,000,000 supply",
});

console.log(reply.response);`;

const historySnippet = `const history = await client.chat({
  chatId: started.chatId,
  history: true,
});

console.log(history.history);`;

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Web3GPT Agents SDK</p>
          <h1>Chat with Web3GPT agents through one skill endpoint.</h1>
          <p className={styles.lede}>
            Start a chat with no params, keep the returned <code>chatId</code>,
            and keep sending messages on the same thread. Deployments happen
            through the agent conversation, including Polygon mainnet.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.primary}
              href="https://w3gpt.ai/skill.md"
              rel="noreferrer"
              target="_blank"
            >
              Read skill guide
            </a>
            <a
              className={styles.secondary}
              href="https://w3gpt.ai/api-docs"
              rel="noreferrer"
              target="_blank"
            >
              API reference
            </a>
          </div>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Install</h2>
            <pre>{installSnippet}</pre>
          </article>
          <article className={styles.card}>
            <h2>Model</h2>
            <ul>
              <li>Create a chat with no params</li>
              <li>Reuse the returned chatId</li>
              <li>Send messages through the same endpoint</li>
              <li>Add history=true when you need full history</li>
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>Quickstart</p>
            <h2>Use the SDK as a thin wrapper over /api/skill.</h2>
          </div>
          <pre>{quickstartSnippet}</pre>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>History</p>
            <h2>History is off by default.</h2>
          </div>
          <pre>{historySnippet}</pre>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>Notes</p>
            <h2>Agent-first deployment flow.</h2>
          </div>
          <ul className={styles.notes}>
            <li>No API key required.</li>
            <li>The old /api/v1 endpoints are removed.</li>
            <li>
              Polygon mainnet deploys are available through the agent, not
              wallet connectors.
            </li>
            <li>The public skill guide lives at https://w3gpt.ai/skill.md.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

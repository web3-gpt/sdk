import styles from "./page.module.css";

const installSnippet = `npm install w3gpt`;

const quickstartSnippet = `import { PolygonChainId, w3gpt } from "w3gpt";

const client = w3gpt();

const prepared = await client.deployContract({
  chainId: PolygonChainId.Mainnet,
  prompt: "An ERC20 named GrantProof with symbol GRANT and fixed supply.",
});

console.log(prepared.response);

const deployed = await client.chat({
  chatId: prepared.chatId,
  message: "Yes. I confirm deployment to Polygon mainnet, chain ID 137.",
});

console.log(deployed.response);`;

const historySnippet = `const history = await client.chat({
  chatId: deployed.chatId,
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
              <li>Select Polygon mainnet (137) or Amoy (80002)</li>
              <li>Generate and review with one typed helper</li>
              <li>Confirm deployment in the same chat</li>
              <li>Reuse the returned chatId</li>
              <li>Send messages through the same endpoint</li>
              <li>Add history=true when you need full history</li>
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>Quickstart</p>
            <h2>Generate and deploy on Polygon mainnet.</h2>
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

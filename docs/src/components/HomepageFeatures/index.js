import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Process-Driven Workflow',
    emoji: '🔄',
    description: (
      <>
        A mandatory flow from discovery to shipping. No step is skipped and every
        change is traceable.
      </>
    ),
  },
  {
    title: 'Specialized Skills',
    emoji: '🧑‍🚀',
    description: (
      <>
        Orchestrator, Architect, Designer, Engineer, Reviewer, Shipper, and more —
        each skill owns one phase and never invades another.
      </>
    ),
  },
  {
    title: 'Spec-Driven Development',
    emoji: '📋',
    description: (
      <>
        Every change, from one-line bug fixes to full features, gets a lightweight
        spec in <code>specs/</code> before implementation starts.
      </>
    ),
  },
  {
    title: 'Design Before Code',
    emoji: '🎨',
    description: (
      <>
        When there is a UI, the Designer defines the aesthetic direction before the
        Engineer writes a single line of markup.
      </>
    ),
  },
  {
    title: 'Quality Gate',
    emoji: '🔍',
    description: (
      <>
        The Reviewer inspects every diff for spec compliance, security,
        performance, and AI artifacts before shipping.
      </>
    ),
  },
  {
    title: 'Conventional Commits',
    emoji: '🚀',
    description: (
      <>
        The Shipper generates commit messages, branches, and PRs following the
        Conventional Commits standard with archived specs.
      </>
    ),
  },
];

function Feature({emoji, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center', styles.featureEmoji)}>{emoji}</div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

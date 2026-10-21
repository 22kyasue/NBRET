# Takumi's GitHub permissions depend on the feature

Accessed October 17, 2026. Both manuals below display October 16 updates and were read as complete main text.

The [assessment integration manual](https://shisho.dev/docs/ja/t/assessment/features/integrations/github/) says installation alone does not enable Slack-mediated repository access: the channel's repository scope must also be configured. It lists outbound source addresses but labels fixed-source-address behavior beta, incomplete across accesses, and subject to change. That is not an immutable network boundary or a complete GitHub App permission manifest.

The separate [Hosted Runner integration](https://shisho.dev/docs/t/runner/architecture/integration/) documents repository Actions and Checks read/write, Metadata read, and organization self-hosted-runner read/write. A workflow-job webhook selects the designated runner label, then creates a just-in-time runner and destroys it after completion.

**These are Runner permissions, not the assessment/autofix App's complete manifest.** Copying that table into an assessment authorization claim would be wrong. The English page carries an automatic-translation/beta warning; its text does not expose isolation implementation or prove destruction after every failure.

Bounded discovery across provider docs and public App references did not establish a complete assessment/autofix App manifest. That remains unknown after the reviewed installation guide, assessment guide and separate Runner guide. No App was installed, repository connected, job triggered, network rule changed or private account inspected.

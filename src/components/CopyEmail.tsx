// Copy, beside the email address in Say hello!: a mailto: link opens nothing for someone whose mail lives in a browser,
// so the address copies with one press and the button says Copied on itself. An island that hydrates when seen
// (client:visible); the caption hides it with no script (when-script), where the link alone stays.
import { CopyButton } from "@/components/ouro/copy-button/copy-button";

export function CopyEmail({ address }: { address: string }) {
  return <CopyButton value={address} variant="plain" size="sm" label="Copy address" failedMessage="The browser blocked copying. Select the address and copy it yourself." />;
}

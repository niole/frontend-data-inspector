import { render } from "solid-js/web";

type Props = {
  content: string
};
function ToastCmp({ content }: Props) {
  return (
    <div class="alert alert-info">
      <span>{content}</span>
    </div>
  );
}

export function InfoToast(content: string) {
  const mount = document.getElementById("msg");
  if (mount) {
    const mounted = render(() => <ToastCmp content={content}/>, mount);
    setTimeout(() => {
      mounted();
    }, 5000);
  }
}

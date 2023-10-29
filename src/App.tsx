import { onMount, createSignal } from 'solid-js';
import { Chart, Title, Tooltip } from 'chart.js'
import { DefaultChart } from 'solid-chartjs';
import { groupBy } from 'ramda';
import { InfoToast } from './Toast';

const COLORS = ['#d81919', '#d6b012', '#26a100', '#b9ba0b', '#ff5100', '#ff8851', '#2aa0b7', '#6ccadc', '#a7e8f5'];

type VisDataPoint = {
  point: [number, number],
  content: string,
  centroid_index: number
};

function App() {
  const [k, setK] = createSignal<number>(0);
  const [textSnippets, setTextSnippets] = createSignal<string>("");
  const [color, setContentColor] = createSignal<string | undefined>();
  const [points, setPoints] = createSignal<VisDataPoint[]>([]);
  const [selectedContent, setContent] = createSignal<string | undefined>();
  const [uri, setUri] = createSignal<string | undefined>();
  const [loadingData, setLoadingData] = createSignal<boolean>(false);
  onMount(() => {
    Chart.register(Tooltip, Title);
  });

  const options = {
      maintainAspectRatio: false,
      plugins: {
        title: {
          text: "sdf",
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx: any) => {
              console.log(ctx);
              setContentColor(ctx?.dataset?.backgroundColor);
              setContent(() => ctx.raw.content);
              return ctx.raw.content;
            }
          }
        },
      }
  };

  async function handleLoading(p: Promise<void>) {
    setLoadingData(true);
    try {
      await p;
    } finally {
      setLoadingData(false);

    }

  }

  function getUriData() {
    handleLoading(fetch(`http://localhost:8080/import?uri=${uri()}&k=${k()}`)
    .then(x => x.json())
    .then(x => {
        setPoints(() => x.data);
    }))
    .catch(e => {
      InfoToast(e.message);
    });
  }

  function getTextSnippetData() {
    const body = { k: k(), data: JSON.parse(textSnippets()) };
    handleLoading(fetch('http://localhost:8080/import',
      { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) }
    )
    .then(x => x.json())
    .then(x => {
        setPoints(() => x.data);
    }))
    .catch(e => {
      InfoToast(e.message);
    });
  }

  return (
    <>
      <div>
        <div style={{display: 'flex', 'flex-direction': 'row'}}>
          <input class="input input-bordered w-20 m-2" placeholder="k" onChange={e => setK(parseInt(e.target.value))} type="number"/>
          <div style={{display: 'flex', 'flex-direction': 'row'}}>
            <input placeholder="uri" onChange={e => setUri(e.target.value)} class="input input-bordered max-w-xs m-2" />
            <textarea class="textarea textarea-bordered m-2" placeholder="JSON text snippets" onChange={e => setTextSnippets(e.target.value)}></textarea>
          </div>
        </div>
        <div>
          <button class="btn btn-primary m-2" onClick={getUriData}>Send URI</button>
          <button class="btn btn-primary m-2"  onClick={getTextSnippetData}>Send Text Snippets</button>
          {loadingData() && <span class="loading loading-ball loading-md"></span> }
        </div>
      </div>
      <div style={{ display: 'flex', 'flex-direction': 'row', height: '500px'}}>
        <span>
          {points().length === 0 && 'No data yet'}
          <DefaultChart
            type="scatter"
            data={{
              datasets: Object.entries(
                groupBy((d: VisDataPoint) => d.centroid_index.toString())(points())
              ).map((
                  [label, ps]: [string, VisDataPoint[] | undefined]
              ) => ({
                  label,
                  backgroundColor: COLORS[parseInt(label)],
                  data: (ps || []).map(p => ({ content: p.content, x: p.point[0],y:  p.point[1] }))
                })
              )
            }}
            options={options}
            width={700}
            height={500}
          />
        </span>
        <div style={{background: color(), 'overflow-y': 'auto', height: '500px'}}>
          {selectedContent()}
        </div>
      </div>
      </>
  );
}

export default App

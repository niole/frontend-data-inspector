import { createEffect, onMount, createSignal } from 'solid-js';
import { Chart, Title, Tooltip } from 'chart.js'
import { DefaultChart } from 'solid-chartjs';
import { groupBy } from 'ramda';

const COLORS = ['#d81919', '#d6b012', '#26a100', '#b9ba0b', '#ff5100', '#ff8851', '#2aa0b7', '#6ccadc', '#a7e8f5'];

const mockData: VisDataPoint[] = [
  {
    point:[105.95724, 298.96707],
    content: "asdf",
    centroid_index: 1
  },
];

type VisDataPoint = {
  point: [number, number],
  content: string,
  centroid_index: number
};

function App() {
  const [color, setContentColor] = createSignal<string | undefined>();
  const [points, setPoints] = createSignal<VisDataPoint[]>([]);
  const [selectedContent, setContent] = createSignal<string | undefined>();
  const [uri, setUri] = createSignal<string | undefined>();
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

  function getUriData() {
    fetch(`http://localhost:8080/import?uri=${uri()}&k=5`)
    .then(x => x.json())
    .then(x => {
        setPoints(() => x.data);
      });
  }

  return (
    <>
      <input placeholder="uri" onChange={e => setUri(e.target.value)}/><button onClick={getUriData}>uri</button>
      <div style={{ display: 'flex', 'flex-direction': 'row'}}>
        <span>
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
        <div style={{background: color(), 'overflow-y': 'auto', height: '500px'}}>{selectedContent()}</div>
      </div>
    </>
  );
}

export default App

export default function Amount({ data, onNext }) {
  const presets = [10, 25, 50, 100];
  return (
    <div className="space-y-6">
      <div>
        <div className="font-medium mb-2">Choose amount</div>
        <div className="flex gap-2 flex-wrap">
          {presets.map(v => (
            <button key={v} className={`btn ${data.amount===v?'btn-primary':'btn-secondary'}`} onClick={()=>onNext({ amount:v }, '/donate/details')}>${v}</button>
          ))}
          <form onSubmit={e=>{e.preventDefault(); onNext({ amount: +e.target.amount.value || data.amount }, '/donate/details');}} className="flex items-center gap-2">
            <input name="amount" placeholder="Custom" className="input w-28" type="number" min={1} step={1} />
            <button className="btn-secondary">Next</button>
          </form>
        </div>
      </div>
      <div>
        <div className="font-medium mb-2">Frequency</div>
        <div className="flex gap-4">
          {['one-time','monthly','yearly'].map(opt => (
            <label key={opt} className="flex items-center gap-2"><input type="radio" name="interval" checked={data.interval===opt} onChange={()=>onNext({ interval: opt }, '/donate/details')} /> {opt}</label>
          ))}
        </div>
      </div>
    </div>
  );
}


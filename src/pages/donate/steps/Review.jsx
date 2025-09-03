import { useNavigate } from 'react-router-dom';

export default function Review({ data, onNext }) {
  const navigate = useNavigate();
  function confirm(){
    const donationId = 'DON-' + Math.random().toString(36).slice(2,8).toUpperCase();
    sessionStorage.setItem('lastDonation', JSON.stringify({ donationId, ...data }));
    onNext({}, '/donate/success');
  }
  return (
    <div className="space-y-4">
      <div className="font-medium">Review</div>
      <ul className="text-sm text-gray-700">
        <li>Amount: <span className="font-semibold">${data.amount}</span></li>
        <li>Frequency: <span className="font-semibold">{data.interval}</span></li>
        <li>Name: <span className="font-semibold">{data.name}</span></li>
        <li>Email: <span className="font-semibold">{data.email}</span></li>
        <li>Payment: <span className="font-semibold">{data.method}</span></li>
      </ul>
      <div className="flex justify-between items-center">
        <button className="btn-secondary" onClick={()=>navigate(-1)}>Back</button>
        <button className="btn-primary" onClick={confirm}>Confirm donation</button>
      </div>
    </div>
  );
}


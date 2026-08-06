const { useState, useEffect, useRef } = React;

const ABI = [
  "function addProduct(uint256 _id, string _name) public",
  "function markShipped(uint256 _id) public",
  "function markDelivered(uint256 _id) public",
  "function assignRole(address _user, uint8 _role) public",
  "function getHistory(uint256 _id) public view returns (tuple(string status, uint256 timestamp, address updatedBy)[])",
  "function getProduct(uint256 _id) public view returns (tuple(uint256 id, string name, string status, address currentHandler, bool exists))",
  "function getAllProductIds() public view returns (uint256[])",
  "function getMyRole() public view returns (uint8)",
  "function admin() public view returns (address)"
];

const ROLE_NAMES = ['None', 'Manufacturer', 'Distributor', 'Retailer'];

function QRCodeBox({ value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && window.QRCode) {
      window.QRCode.toCanvas(canvasRef.current, value, { width: 140, margin: 1 }, function (error) {
        if (error) console.error(error);
      });
    }
  }, [value]);

  return (
    <div className="qr-box">
      <canvas ref={canvasRef}></canvas>
      <div className="qr-hint">Scan to look up Product #{value.split('id=')[1] || value}</div>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [contractAddr, setContractAddr] = useState('');
  const [myRole, setMyRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrProductId, setQrProductId] = useState(null);

  const [addId, setAddId] = useState('');
  const [addName, setAddName] = useState('');
  const [addMsg, setAddMsg] = useState({ text: '', kind: '' });

  const [actionId, setActionId] = useState('');
  const [actionMsg, setActionMsg] = useState({ text: '', kind: '' });

  const [roleAddr, setRoleAddr] = useState('');
  const [roleValue, setRoleValue] = useState('1');
  const [roleMsg, setRoleMsg] = useState({ text: '', kind: '' });

  const [lookupId, setLookupId] = useState('');
  const [lookupMsg, setLookupMsg] = useState({ text: '', kind: '' });
  const [history, setHistory] = useState([]);

  async function connectWallet() {
    if (!window.ethereum) {
      setAddMsg({ text: 'MetaMask not detected', kind: 'err' });
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
  }

  async function getContract() {
    if (!contractAddr.trim()) throw new Error('Enter the deployed contract address first');
    if (!account) throw new Error('Connect your wallet first');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddr.trim(), ABI, signer);
  }

  async function refreshRoleAndAdmin() {
    try {
      const c = await getContract();
      const role = await c.getMyRole();
      setMyRole(Number(role));
      const adminAddr = await c.admin();
      setIsAdmin(adminAddr.toLowerCase() === account.toLowerCase());
    } catch (e) { /* silent until contract address is filled in */ }
  }

  async function refreshProducts() {
    try {
      const c = await getContract();
      const ids = await c.getAllProductIds();
      const list = [];
      for (const id of ids) {
        const p = await c.getProduct(id);
        list.push({ id: Number(p.id), name: p.name, status: p.status, handler: p.currentHandler });
      }
      setProducts(list);
    } catch (e) { /* silent */ }
  }

  useEffect(() => {
    if (account && contractAddr.trim()) {
      refreshRoleAndAdmin();
      refreshProducts();
    }
  }, [account, contractAddr]);

  async function handleAddProduct() {
    try {
      if (!addId || !addName) throw new Error('Fill in both fields');
      const c = await getContract();
      setAddMsg({ text: 'Confirm the transaction in your wallet...', kind: 'pending' });
      const tx = await c.addProduct(addId, addName);
      setAddMsg({ text: 'Waiting for confirmation...', kind: 'pending' });
      await tx.wait();
      setAddMsg({ text: `Product #${addId} registered. Tx: ${tx.hash.slice(0, 10)}...`, kind: 'ok' });
      refreshProducts();
    } catch (e) {
      setAddMsg({ text: e.reason || e.message, kind: 'err' });
    }
  }

  async function handleMarkShipped() {
    try {
      if (!actionId) throw new Error('Enter a product ID');
      const c = await getContract();
      setActionMsg({ text: 'Confirm the transaction...', kind: 'pending' });
      const tx = await c.markShipped(actionId);
      await tx.wait();
      setActionMsg({ text: `Marked shipped. Tx: ${tx.hash.slice(0, 10)}...`, kind: 'ok' });
      refreshProducts();
    } catch (e) {
      setActionMsg({ text: e.reason || e.message, kind: 'err' });
    }
  }

  async function handleMarkDelivered() {
    try {
      if (!actionId) throw new Error('Enter a product ID');
      const c = await getContract();
      setActionMsg({ text: 'Confirm the transaction...', kind: 'pending' });
      const tx = await c.markDelivered(actionId);
      await tx.wait();
      setActionMsg({ text: `Marked delivered. Tx: ${tx.hash.slice(0, 10)}...`, kind: 'ok' });
      refreshProducts();
    } catch (e) {
      setActionMsg({ text: e.reason || e.message, kind: 'err' });
    }
  }

  async function handleAssignRole() {
    try {
      if (!roleAddr) throw new Error('Enter a wallet address');
      const c = await getContract();
      setRoleMsg({ text: 'Confirm the transaction...', kind: 'pending' });
      const tx = await c.assignRole(roleAddr, roleValue);
      await tx.wait();
      setRoleMsg({ text: `Role assigned. Tx: ${tx.hash.slice(0, 10)}...`, kind: 'ok' });
    } catch (e) {
      setRoleMsg({ text: e.reason || e.message, kind: 'err' });
    }
  }

  async function handleLookup(idOverride) {
    try {
      const idToUse = idOverride || lookupId;
      if (!idToUse) throw new Error('Enter a product ID');
      const c = await getContract();
      setLookupMsg({ text: 'Fetching...', kind: 'pending' });
      const result = await c.getHistory(idToUse);
      if (result.length === 0) {
        setLookupMsg({ text: 'No history found for this ID', kind: 'err' });
        setHistory([]);
        return;
      }
      setLookupMsg({ text: `${result.length} record(s) found`, kind: 'ok' });
      setHistory(result.map(entry => ({
        status: entry.status,
        date: new Date(Number(entry.timestamp) * 1000).toLocaleString(),
        updatedBy: entry.updatedBy
      })));
    } catch (e) {
      setLookupMsg({ text: e.reason || e.message, kind: 'err' });
      setHistory([]);
    }
  }

  function jumpToLookup(id) {
    setLookupId(String(id));
    setTab('lookup');
    setTimeout(() => handleLookup(String(id)), 100);
  }

  const roleLabel = isAdmin ? 'Admin' : (myRole !== null ? ROLE_NAMES[myRole] : '...');

  const filteredProducts = products.filter(p =>
    !searchTerm ||
    String(p.id).includes(searchTerm) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header>
        <div>
          <div className="eyebrow">On-chain ledger</div>
          <h1>Supply Chain Tracker</h1>
        </div>
        <div>
          <button className="connect" onClick={connectWallet} disabled={!!account}>
            {account ? 'Connected' : 'Connect Wallet'}
          </button>
          {account && (
            <div className="acct">
              {account.slice(0, 6)}...{account.slice(-4)}
              <div><span className={`role-badge role-${roleLabel}`}>{roleLabel}</span></div>
            </div>
          )}
        </div>
      </header>

      <div className="card">
        <h2>Contract</h2>
        <label>Deployed address (Sepolia)</label>
        <input className="addr-input" placeholder="0x..." value={contractAddr} onChange={e => setContractAddr(e.target.value)} />
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`tab ${tab === 'actions' ? 'active' : ''}`} onClick={() => setTab('actions')}>My Actions</button>
        <button className={`tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')}>Admin</button>
        <button className={`tab ${tab === 'lookup' ? 'active' : ''}`} onClick={() => setTab('lookup')}>Lookup History</button>
      </div>

      {tab === 'dashboard' && (
        <div className="card">
          <h2>All Products</h2>
          <label>Search by ID or name</label>
          <input placeholder="e.g. 1 or Mouse" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {filteredProducts.length === 0 ? (
            <div className="empty" style={{ marginTop: '12px' }}>No products found, or connect wallet + enter contract address above.</div>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Status</th><th>Current Handler</th><th></th></tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td><span className={`status-pill status-${p.status}`}>{p.status}</span></td>
                    <td>{p.handler.slice(0, 6)}...{p.handler.slice(-4)}</td>
                    <td>
                      <button className="action small" onClick={() => setQrProductId(p.id)}>QR</button>
                      {' '}
                      <button className="action secondary small" onClick={() => jumpToLookup(p.id)}>History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {qrProductId !== null && (
            <QRCodeBox value={`${window.location.href.split('?')[0]}?lookup_id=${qrProductId}`} />
          )}
          <button className="action secondary" onClick={refreshProducts} style={{ marginTop: '16px' }}>Refresh</button>
        </div>
      )}

      {tab === 'actions' && (
        <div>
          <div className="card">
            <h2>Register Product (Manufacturer only)</h2>
            <div className="row">
              <div>
                <label>Product ID</label>
                <input type="number" placeholder="1" value={addId} onChange={e => setAddId(e.target.value)} />
              </div>
              <div>
                <label>Name</label>
                <input placeholder="Wireless Mouse" value={addName} onChange={e => setAddName(e.target.value)} />
              </div>
            </div>
            <button className="action" onClick={handleAddProduct}>Register Product</button>
            <div className={`msg ${addMsg.kind}`}>{addMsg.text}</div>
          </div>

          <div className="card">
            <h2>Update Status (Distributor / Retailer)</h2>
            <label>Product ID</label>
            <input type="number" placeholder="1" value={actionId} onChange={e => setActionId(e.target.value)} />
            <div className="row" style={{ marginTop: '12px' }}>
              <button className="action" onClick={handleMarkShipped}>Mark Shipped (Distributor)</button>
              <button className="action secondary" onClick={handleMarkDelivered}>Mark Delivered (Retailer)</button>
            </div>
            <div className={`msg ${actionMsg.kind}`}>{actionMsg.text}</div>
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <div className="card">
          <h2>Assign Role (Admin only)</h2>
          <label>Wallet address</label>
          <input className="addr-input" placeholder="0x..." value={roleAddr} onChange={e => setRoleAddr(e.target.value)} />
          <label>Role</label>
          <select value={roleValue} onChange={e => setRoleValue(e.target.value)}>
            <option value="1">Manufacturer</option>
            <option value="2">Distributor</option>
            <option value="3">Retailer</option>
          </select>
          <button className="action" onClick={handleAssignRole}>Assign Role</button>
          <div className={`msg ${roleMsg.kind}`}>{roleMsg.text}</div>
          <p className="qr-hint" style={{ marginTop: '16px' }}>
            Note: anyone without an assigned role (a "Customer") can still freely view any product's history in the Lookup History tab — no role needed for that.
          </p>
        </div>
      )}

      {tab === 'lookup' && (
        <div className="card">
          <h2>Lookup History</h2>
          <label>Product ID</label>
          <input type="number" placeholder="1" value={lookupId} onChange={e => setLookupId(e.target.value)} />
          <button className="action" onClick={() => handleLookup()}>Get History</button>
          <div className={`msg ${lookupMsg.kind}`}>{lookupMsg.text}</div>
          <div className="timeline">
            {history.map((entry, i) => (
              <div className="entry" key={i}>
                <div className="label">{entry.status}</div>
                <div className="meta">{entry.date} · {entry.updatedBy.slice(0, 6)}...{entry.updatedBy.slice(-4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

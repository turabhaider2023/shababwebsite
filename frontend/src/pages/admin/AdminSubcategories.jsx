import { useEffect, useState } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function AdminSubcategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('kids');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/categories').then((res) => setCategories(res.data)).catch(() => toast('Could not load categories'));

  useEffect(() => {
    document.title = 'Subcategories · ZAYVORN';
    load();
  }, []);

  const current = categories.find((item) => item.slug === category) || categories[0];

  const add = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/subcategories', { category: current?.slug || category, name: name.trim() });
      setName('');
      await load();
      toast('Subcategory added');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add the subcategory');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (sub) => {
    if (!window.confirm(`Remove ${sub.name}?`)) return;
    try {
      await api.delete(`/admin/subcategories/${sub.id}`);
      await load();
      toast('Subcategory removed');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not remove it');
    }
  };

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">Catalogue</p>
          <h1>Subcategories</h1>
        </div>
      </div>
      <p className="note">Add your own, like Toys under Kids. It shows in the shop menu and on the product form.</p>
      <form className="form-grid" onSubmit={add} style={{ marginTop: 16, maxWidth: 720 }}>
        <label className="field">
          <span>Category</span>
          <select value={current?.slug || category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>New subcategory</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Toys" required />
        </label>
        <div className="field" style={{ justifyContent: 'end' }}>
          <span>&nbsp;</span>
          <button className="btn btn-accent" disabled={busy} type="submit">
            {busy ? 'Adding…' : 'Add subcategory'}
          </button>
        </div>
      </form>

      <div className="table-wrap" style={{ marginTop: 22 }}>
        <table>
          <thead>
            <tr>
              <th>Subcategory</th>
              <th>Products</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(current?.subcategories || []).map((sub) => (
              <tr key={sub.slug}>
                <td>
                  {sub.name}
                  {sub.custom && <span className="muted"> · added by you</span>}
                </td>
                <td>{sub.count}</td>
                <td>
                  {sub.custom && (
                    <button type="button" className="linkish" onClick={() => remove(sub)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

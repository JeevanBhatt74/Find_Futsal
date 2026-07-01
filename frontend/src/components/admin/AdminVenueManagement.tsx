import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { Venue, VenueImage } from '@/types';
import ImageUploader from './ImageUploader';

const AMENITIES_LIST = ['Showers', 'Parking', 'Pro Turf', 'Air Con', 'Changing Rooms', 'Floodlights', 'Cafeteria'];

export default function AdminVenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Kathmandu');
  const [pricePerHour, setPricePerHour] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<VenueImage[]>([]);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      // Using public route for venues since the admin route doesn't return full data yet or we can use admin route.
      const res = await api.get('/admin/venues');
      setVenues(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch venues');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCity('');
    setAddress('');
    setDistrict('Kathmandu');
    setPricePerHour('');
    setContactPhone('');
    setDescription('');
    setSelectedAmenities([]);
    setImages([]);
    setIsFormOpen(false);
  };

  const handleEdit = (venue: Venue) => {
    setEditingId(venue._id);
    setName(venue.name);
    setCity(venue.location.city);
    setAddress(venue.location.address);
    setDistrict(venue.location.district);
    setPricePerHour(venue.pricePerHour.toString());
    setContactPhone(venue.contactPhone);
    setDescription(venue.description || '');
    setSelectedAmenities(venue.amenities);
    setImages(venue.images);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    try {
      await api.delete(`/admin/venues/${id}`);
      toast.success('Venue deleted successfully');
      fetchVenues();
    } catch (err) {
      toast.error('Failed to delete venue');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      location: { city, address, district },
      pricePerHour: Number(pricePerHour),
      contactPhone,
      amenities: selectedAmenities,
      images,
      currency: 'NPR',
      isActive: true,
    };

    try {
      if (editingId) {
        await api.put(`/admin/venues/${editingId}`, payload);
        toast.success('Venue updated successfully');
      } else {
        await api.post('/admin/venues', payload);
        toast.success('Venue created successfully');
      }
      resetForm();
      fetchVenues();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save venue');
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.location.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-text">Venue Management</h2>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="btn-primary btn-sm flex items-center gap-2">
          <Plus size={16} /> Add Venue
        </button>
      </div>

      {!isFormOpen ? (
        <div className="card bg-white border border-gray-200 rounded-[12px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search venues..." 
                className="input pl-9 h-9 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-cool-grey font-semibold">
                <tr>
                  <th className="px-4 py-3">Venue Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Price/Hr</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredVenues.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No venues found</td></tr>
                ) : (
                  filteredVenues.map(venue => (
                    <tr key={venue._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-text">{venue.name}</td>
                      <td className="px-4 py-3 text-cool-grey">{venue.location.city}, {venue.location.address}</td>
                      <td className="px-4 py-3 font-medium">Rs. {venue.pricePerHour}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${venue.isActive ? 'badge-available' : 'badge-maintenance'}`}>
                          {venue.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleEdit(venue)} className="p-1.5 text-gray-500 hover:text-primary transition-colors bg-white rounded shadow-sm border border-gray-200">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(venue._id)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors bg-white rounded shadow-sm border border-gray-200">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card bg-white border border-gray-200 rounded-[12px] p-6 relative">
          <button onClick={resetForm} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
          
          <h3 className="text-lg font-bold text-slate-text mb-6">
            {editingId ? 'Edit Venue' : 'Create New Venue'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="floating-label-group">
                <input required type="text" id="name" className="floating-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <label htmlFor="name" className="floating-label">Venue Name *</label>
              </div>
              <div className="floating-label-group">
                <input required type="text" id="city" className="floating-input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                <label htmlFor="city" className="floating-label">City *</label>
              </div>
              <div className="floating-label-group">
                <input required type="text" id="address" className="floating-input" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
                <label htmlFor="address" className="floating-label">Address *</label>
              </div>
              <div className="floating-label-group">
                <input required type="number" id="price" className="floating-input" placeholder="Price" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} />
                <label htmlFor="price" className="floating-label">Price / Hr (Rs.) *</label>
              </div>
              <div className="floating-label-group">
                <input required type="tel" id="phone" className="floating-input" placeholder="Phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                <label htmlFor="phone" className="floating-label">Contact Phone *</label>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-text mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:border-primary/50">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary focus:ring-primary"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAmenities([...selectedAmenities, amenity]);
                        else setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                      }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-text mb-2">Images</h4>
              <ImageUploader images={images} onChange={setImages} />
            </div>

            <div className="floating-label-group h-24">
              <textarea id="desc" className="floating-input h-full resize-none pt-3" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <label htmlFor="desc" className="floating-label">Description</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Update Venue' : 'Create Venue'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

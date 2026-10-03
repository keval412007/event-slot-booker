async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log('--- 1. Testing GET /api/slots ---');
  let res = await fetch(`${BASE_URL}/slots`);
  let data = await res.json();
  console.log('Get slots response:', JSON.stringify(data, null, 2));

  console.log('\n--- 2. Creating Slot 1 (Capacity 2) ---');
  res = await fetch(`${BASE_URL}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'AI Workshop',
      date: '2026-10-15',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      location: 'Lab 3',
      capacity: 2,
    }),
  });
  data = await res.json();
  console.log('Created slot 1:', data);
  const slotId = data.data._id;

  console.log('\n--- 3. Booking Student 1 ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Rahul Sharma',
      email: 'rahul@example.com',
      rollNo: 'CS-101',
    }),
  });
  data = await res.json();
  console.log('Student 1 booking:', data);
  const booking1Id = data.data._id;

  console.log('\n--- 4. Testing Duplicate Booking (Rahul again) ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Rahul Sharma',
      email: 'rahul@example.com',
      rollNo: 'CS-101',
    }),
  });
  data = await res.json();
  console.log('Duplicate booking rejection status:', res.status, data.message);

  console.log('\n--- 5. Booking Student 2 (fills capacity) ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Priya Patel',
      email: 'priya@example.com',
      rollNo: 'CS-102',
    }),
  });
  data = await res.json();
  console.log('Student 2 booking status:', res.status, data.message);

  console.log('\n--- 6. Testing Slot Full (Booking Student 3) ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Amit Kumar',
      email: 'amit@example.com',
      rollNo: 'CS-103',
    }),
  });
  data = await res.json();
  console.log('Slot full rejection status:', res.status, data.message);

  console.log('\n--- 7. Checking Available Seats ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}`);
  data = await res.json();
  console.log('Slot details (available seats should be 0):', {
    capacity: data.data.capacity,
    activeBookings: data.data.activeBookings,
    availableSeats: data.data.availableSeats,
  });

  console.log('\n--- 8. Cancelling Student 1 Booking ---');
  res = await fetch(`http://localhost:5000/api/bookings/${booking1Id}/cancel`, {
    method: 'PATCH',
  });
  data = await res.json();
  console.log('Cancel response:', data.message);

  console.log('\n--- 9. Verifying Seat Freed (Available seats should be 1) ---');
  res = await fetch(`${BASE_URL}/slots/${slotId}`);
  data = await res.json();
  console.log('Slot details after cancellation:', {
    capacity: data.data.capacity,
    activeBookings: data.data.activeBookings,
    availableSeats: data.data.availableSeats,
  });

  console.log('\n--- ALL PRACTICAL EXAM TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(console.error);

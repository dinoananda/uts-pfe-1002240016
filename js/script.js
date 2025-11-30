// Struktur Data Awal DITAMBAH field 'cpuCount' dan 'diskSize'
let servers = [
    { id: 1, name: "WEB001", ipAddress: "192.168.1.10", ramSize: 16, cpuCount: 8, diskSize: 1000, rackId: "R1A", status: "Online" },
    { id: 2, name: "DB001", ipAddress: "192.168.1.20", ramSize: 64, cpuCount: 16, diskSize: 2000, rackId: "R2B", status: "Online" },
    { id: 3, name: "PROXY01", ipAddress: "10.0.0.5", ramSize: 8, cpuCount: 4, diskSize: 500, rackId: "R1A", status: "Offline" }
];

// Data Jenis 2: Rack Location (Tidak Berubah)
const racks = [
    { id: "R1A", name: "Rack 1 - Area A" },
    { id: "R2B", name: "Rack 2 - Area B" },
    { id: "R3C", name: "Rack 3 - Area C" }
];

let nextServerId = servers.length > 0 ? Math.max(...servers.map(s => s.id)) + 1 : 1;
let currentEditId = null;

// Ambil elemen-elemen DOM (DITAMBAH elemen baru)
const serverForm = document.getElementById('server-form');
const rackIdSelect = document.getElementById('rack-id');
const serverTableBody = document.querySelector('#server-table tbody');
const feedbackMessage = document.getElementById('feedback-message');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const calculateTotalButton = document.getElementById('calculate-total');
const calculationResultDiv = document.getElementById('calculation-result');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit');
// Ambil elemen input CPU dan Disk untuk memudahkan pengambilan nilai
const cpuCountInput = document.getElementById('cpu-count');
const diskSizeInput = document.getElementById('disk-size');


// Fungsi buatan sendiri: Menampilkan pesan feedback (Tidak Berubah)
function showFeedback(message, type = 'success') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = type;
    feedbackMessage.classList.remove('hidden');

    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
    }, 3000);
}

// Mengisi opsi Rack Location (Tidak Berubah)
function populateRackSelect() {
    rackIdSelect.innerHTML = '<option value="">-- Pilih Rack --</option>';
    racks.forEach(rack => {
        const option = document.createElement('option');
        option.value = rack.id;
        option.textContent = rack.name;
        rackIdSelect.appendChild(option);
    });
}

// Merender (menampilkan) daftar server ke tabel (DIPERBARUI)
function renderServers(dataToDisplay) {
    serverTableBody.innerHTML = '';

    if (dataToDisplay.length === 0) {
        const row = serverTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 8; // Ubah colspan menjadi 8 (sebelumnya 6)
        cell.textContent = "Tidak ada data server yang ditemukan.";
        cell.style.textAlign = 'center';
        return;
    }

    dataToDisplay.forEach(server => {
        const row = serverTableBody.insertRow();
        const rackName = racks.find(r => r.id === server.rackId)?.name || server.rackId;

        // Kolom data (DITAMBAH CPU dan DISK)
        row.insertCell().textContent = server.name;
        row.insertCell().textContent = server.ipAddress;
        row.insertCell().textContent = server.ramSize + " GB";
        row.insertCell().textContent = server.cpuCount; // DATA BARU: CPU
        row.insertCell().textContent = server.diskSize + " GB"; // DATA BARU: DISK
        row.insertCell().textContent = rackName;
        
        // Kolom Status
        const statusCell = row.insertCell();
        statusCell.textContent = server.status;
        statusCell.className = server.status === 'Online' ? 'status-online' : 'status-offline';

        // Kolom Aksi
        const actionCell = row.insertCell();
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'action-btn edit-btn';
        editBtn.addEventListener('click', () => editServer(server.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.addEventListener('click', () => deleteServer(server.id));

        actionCell.appendChild(editBtn);
        actionCell.appendChild(deleteBtn);
    });
}

// --- Fitur Utama (CRUD) ---

// Fitur 1: Tambah/Ubah Data (DIPERBARUI)
function handleFormSubmit(event) {
    event.preventDefault();

    // Ambil nilai dari form (DITAMBAH CPU dan DISK)
    const serverName = document.getElementById('server-name').value.trim();
    const ipAddress = document.getElementById('ip-address').value.trim();
    const ramSize = parseInt(document.getElementById('ram-size').value, 10);
    const cpuCount = parseInt(cpuCountInput.value, 10); // Ambil nilai CPU
    const diskSize = parseInt(diskSizeInput.value, 10); // Ambil nilai Disk
    const rackId = rackIdSelect.value;
    const status = serverForm.querySelector('input[name="status"]:checked').value;

    // Validasi Sederhana (DIPERBARUI)
    if (!serverName || !ipAddress || !rackId) {
        showFeedback("Semua field wajib diisi!", "error");
        return;
    }
    if (ramSize <= 0 || cpuCount <= 0 || diskSize <= 0) {
        showFeedback("RAM, CPU, dan Ukuran Disk harus lebih dari 0!", "error");
        return;
    }

    // Objek Server Baru/Update (DITAMBAH CPU dan DISK)
    const newServerData = {
        name: serverName,
        ipAddress: ipAddress,
        ramSize: ramSize,
        cpuCount: cpuCount,
        diskSize: diskSize,
        rackId: rackId,
        status: status
    };

    if (currentEditId) {
        // Logika Ubah Data (Update)
        const index = servers.findIndex(s => s.id === currentEditId);
        if (index !== -1) {
            servers[index] = { ...servers[index], ...newServerData };
            showFeedback(`Server ${serverName} berhasil diubah.`);
        }
    } else {
        // Logika Tambah Data (Create)
        const newServer = { id: nextServerId++, ...newServerData };
        servers.push(newServer);
        showFeedback(`Server ${serverName} berhasil ditambahkan.`);
    }

    resetForm();
    applyFilterAndSearch();
}

// Fitur 2: Ubah Data (Edit - Bagian 1) (DIPERBARUI)
function editServer(id) {
    const server = servers.find(s => s.id === id);
    if (!server) return;

    // Isi form dengan data server yang akan diubah (DITAMBAH CPU dan DISK)
    document.getElementById('server-name').value = server.name;
    document.getElementById('ip-address').value = server.ipAddress;
    document.getElementById('ram-size').value = server.ramSize;
    cpuCountInput.value = server.cpuCount; // Isi nilai CPU
    diskSizeInput.value = server.diskSize; // Isi nilai Disk
    document.getElementById('rack-id').value = server.rackId;
    document.querySelector(`input[name="status"][value="${server.status}"]`).checked = true;

    // Atur status edit
    currentEditId = id;
    submitButton.textContent = 'Simpan Perubahan';
    cancelEditButton.classList.remove('hidden');

    // Scroll ke bagian form
    document.getElementById('tambah-server').scrollIntoView({ behavior: 'smooth' });
}

// Fitur 3: Hapus Data (Delete) (Tidak Berubah)
function deleteServer(id) {
    if (confirm("Anda yakin ingin menghapus server ini?")) {
        const serverName = servers.find(s => s.id === id)?.name || "Server";
        servers = servers.filter(server => server.id !== id);
        showFeedback(`${serverName} berhasil dihapus.`, "error");
        applyFilterAndSearch();
    }
}

// Fungsi untuk mereset form dan UI edit (Tidak Berubah)
function resetForm() {
    serverForm.reset();
    currentEditId = null;
    submitButton.textContent = 'Tambah Server';
    cancelEditButton.classList.add('hidden');
}

// --- Fitur Tambahan (Filter, Search, Calculation) ---

// Fitur: Filter/Pencarian (Tidak Berubah)
function applyFilterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterStatus.value;

    let filteredServers = servers.filter(server => {
        const statusMatch = filterValue === 'all' || server.status === filterValue;
        const searchMatch = server.name.toLowerCase().includes(searchTerm) ||
                            server.ipAddress.includes(searchTerm);

        return statusMatch && searchMatch;
    });

    renderServers(filteredServers);
}

// Fitur: Perhitungan Sederhana (Total Server) (DIPERBARUI)
function calculateTotalServers() {
    // Perhitungan sederhana: Total RAM, Total CPU, dan Total Disk
    const totalServers = servers.length;
    const totalOnline = servers.filter(s => s.status === 'Online').length;
    const totalRam = servers.reduce((sum, s) => sum + s.ramSize, 0);
    const totalCpu = servers.reduce((sum, s) => sum + s.cpuCount, 0); // Total CPU
    const totalDisk = servers.reduce((sum, s) => sum + s.diskSize, 0); // Total Disk

    // Manipulasi DOM: Mengubah teks
    calculationResultDiv.innerHTML = `
        <p>📊 **Total Server:** ${totalServers} unit</p>
        <p>🟢 **Server Online:** ${totalOnline} unit</p>
        <p>📦 **Total RAM:** ${totalRam} GB</p>
        <p>🧠 **Total CPU Cores:** ${totalCpu} core</p>
        <p>🗄️ **Total Disk Space:** ${totalDisk} GB</p>
    `;
}

// --- Event Listeners dan Inisialisasi (Tidak Berubah) ---
serverForm.addEventListener('submit', handleFormSubmit);
cancelEditButton.addEventListener('click', resetForm);
searchInput.addEventListener('input', applyFilterAndSearch);
filterStatus.addEventListener('change', applyFilterAndSearch);
calculateTotalButton.addEventListener('click', calculateTotalServers);

document.addEventListener('DOMContentLoaded', () => {
    populateRackSelect();
    renderServers(servers);
    calculateTotalServers();
});
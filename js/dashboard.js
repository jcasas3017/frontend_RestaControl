/* =====================================================
   RestaControl — Dashboard Page Logic
   Carga las métricas reales desde el backend (GET /api/dashboard).
   ===================================================== */

(() => {
    const API_BASE = String(window.APP_CONFIG?.API_BASE_URL ?? '').replace(/\/+$/, '');
    const REQUEST_TIMEOUT_MS = 10000;

    async function init() {
        const authenticated = await Auth.requireLogin();

        if (!authenticated) {
            return;
        }

        byId('btnReintentarDashboard')?.addEventListener('click', render);

        await render();
    }

    async function render() {
        hideError();
        setLoading(true);

        try {
            const data = await fetchDashboardFromApi();

            renderStats(data);
            renderReservas(data.reservas?.rows || []);
            renderAtenciones(data.atenciones?.rows || []);
        } catch (error) {
            console.error('No se pudo cargar el dashboard:', error);
            clearTables();
            showError(error.message);
        }
    }

    async function fetchDashboardFromApi() {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        let response;
        try {
            response = await fetch(`${API_BASE}/api/dashboard`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'include',
                signal: controller.signal
            });
        } catch (error) {
            throw new Error(error.name === 'AbortError'
                ? 'El backend tardó demasiado en responder.'
                : 'No se pudo conectar con el backend.');
        } finally {
            clearTimeout(timer);
        }

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(payload?.message || `El backend respondió con error ${response.status}.`);
        }

        const data = payload?.data ?? payload;
        if (!data || typeof data !== 'object') {
            throw new Error('La respuesta del backend no tiene el formato esperado.');
        }

        return data;
    }

    function setLoading(loading) {
        if (!loading) return;
        const row = '<tr><td colspan="6" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm me-2"></div>Cargando...</td></tr>';
        const reservas = byId('dashReservasBody');
        const atenciones = byId('dashAtencionesBody');
        if (reservas) reservas.innerHTML = row;
        if (atenciones) atenciones.innerHTML = row;
    }

    function clearTables() {
        const row = '<tr><td colspan="6" class="text-center text-muted py-4">Sin datos disponibles.</td></tr>';
        const reservas = byId('dashReservasBody');
        const atenciones = byId('dashAtencionesBody');
        if (reservas) reservas.innerHTML = row;
        if (atenciones) atenciones.innerHTML = row;
    }

    function showError(message) {
        setText('dashErrorMessage', message || 'No se pudo cargar el dashboard.');
        byId('dashError')?.classList.remove('d-none');
    }

    function hideError() {
        byId('dashError')?.classList.add('d-none');
    }

    function renderStats(data) {
        setText('dashCategoriasActivas', String(data.categorias.active));
        setText('dashCategoriasNote', `de ${data.categorias.total} registradas`);

        setText('dashPlatosDisponibles', String(data.platos.available));
        setText('dashPlatosNote', `de ${data.platos.total} en carta`);

        setText('dashMesasActivas', String(data.mesas.active));
        setText('dashMesasNote', `de ${data.mesas.total} configuradas`);

        setText('dashReservasVigentes', String(data.reservas.active));
        setText('dashReservasNote', `${data.reservas.confirmed} confirmadas`);

        setText('dashAtencionesEnCurso', String(data.atenciones.inProgress));
        setText('dashAtencionesNote', `${data.atenciones.closedToday} cerradas hoy`);

        setText('dashPedidosRegistrados', String(data.pedidos.total));
        setText('dashPedidosNote', `${data.pedidos.items} ítems en detalle`);
    }

    function renderReservas(rows) {
        const container = byId('dashReservasBody');
        if (!container) return;
        if (!rows.length) {
            container.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay reservas vigentes.</td></tr>';
            return;
        }

        container.innerHTML = rows.map((row, idx) => {
            const displayIndex = (row && (row.index !== undefined && row.index !== null)) ? row.index : (idx + 1);
            return `
            <tr>
                <td><span class="record-id">#${displayIndex}</span></td>
                <td><span class="fw-semibold">${escapeHtml(row.cliente)}</span></td>
                <td>${escapeHtml(row.mesa)}</td>
                <td>${escapeHtml(row.fechaHora)}</td>
                <td>${escapeHtml(String(row.personas))}</td>
                <td>${renderBadge(row.estado)}</td>
            </tr>
        `;
        }).join('');
    }

    function renderAtenciones(rows) {
        const container = byId('dashAtencionesBody');
        if (!container) return;
        if (!rows.length) {
            container.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay atenciones para mostrar.</td></tr>';
            return;
        }

        container.innerHTML = rows.map((row, idx) => {
            const displayIndex = (row && (row.index !== undefined && row.index !== null)) ? row.index : (idx + 1);
            return `
            <tr>
                <td><span class="record-id">#${displayIndex}</span></td>
                <td>${escapeHtml(row.cliente)}</td>
                <td>${escapeHtml(row.mesa)}</td>
                <td>${escapeHtml(row.mozo)}</td>
                <td>${renderBadge(row.estado)}</td>
                <td>${renderBadge(row.pago, true)}</td>
            </tr>
        `;
        }).join('');
    }

    function renderBadge(value, isPago = false) {
        const raw = String(value || '').replace(/_/g, ' ').toLowerCase();
        let klass = 'bp-secondary';
        if (isPago) {
            if (raw.includes('pag')) klass = 'bp-success';
            else if (raw.includes('pend')) klass = 'bp-warning';
            else if (raw.includes('cancel')) klass = 'bp-danger';
        } else {
            if (raw.includes('en curso')) klass = 'bp-info';
            else if (raw.includes('confirmada') || raw.includes('pagada')) klass = 'bp-success';
            else if (raw.includes('pend')) klass = 'bp-warning';
            else if (raw.includes('cerr')) klass = 'bp-gray';
            else if (raw.includes('cancel')) klass = 'bp-danger';
        }
        const label = String(value || '').replace(/_/g, ' ');
        return `<span class="badge-pill ${klass}">${escapeHtml(label)}</span>`;
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function setText(id, text) {
        const el = byId(id);
        if (el) el.textContent = text;
    }

    window.Dashboard = { init };
})();

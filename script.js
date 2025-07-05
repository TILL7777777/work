document.addEventListener('DOMContentLoaded', () => {
    const name = document.title.split(' - ')[1];
    const form = document.getElementById('work-sheet-form');
    const addRowButton = document.getElementById('add-row');
    const saveButton = document.getElementById('save');
    const calendarLinkButton = document.getElementById('calendar-link');

    let rowCounter = 0; // Use a global counter for unique IDs
    let currentSaveDate; // This will store the date to be used for saving

    // Helper function to create an entry block element
    function createEntryBlockElement(data = {}) {
        rowCounter++;
        const newBlock = document.createElement('div');
        newBlock.classList.add('entry-block');

        newBlock.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="date-${rowCounter}">日付</label>
                    <input type="date" id="date-${rowCounter}" name="date-${rowCounter}" value="${data.date || ''}" ${rowCounter === 1 ? '' : 'readonly'}> <!-- Make date readonly for subsequent rows -->
                </div>
                <div class="form-group">
                    <label for="name-${rowCounter}">名前</label>
                    <input type="text" id="name-${rowCounter}" name="name-${rowCounter}" value="${data.name || name}" readonly>
                </div>
                <div class="form-group">
                    <label for="work-number-${rowCounter}">工作番号</label>
                    <input type="text" id="work-number-${rowCounter}" name="work-number-${rowCounter}" value="${data.workNumber || ''}">
                </div>
                <div class="form-group">
                    <label for="mold-number-${rowCounter}">金型番号</label>
                    <input type="text" id="mold-number-${rowCounter}" name="mold-number-${rowCounter}" value="${data.moldNumber || ''}">
                </div>
                <div class="form-group">
                    <label for="task-number-${rowCounter}">作業番号</label>
                    <input type="text" id="task-number-${rowCounter}" name="task-number-${rowCounter}" value="${data.taskNumber || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="start-time-${rowCounter}">開始時間</label>
                    <input type="time" id="start-time-${rowCounter}" name="start-time-${rowCounter}" step="300" value="${data.startTime || '08:00'}">
                </div>
                <div class="form-group">
                    <label for="end-time-${rowCounter}">終了時間</label>
                    <input type="time" id="end-time-${rowCounter}" name="end-time-${rowCounter}" step="300" value="${data.endTime || ''}">
                </div>
                <div class="form-group">
                    <label for="work-content-${rowCounter}">作業内容</label>
                    <input type="text" id="work-content-${rowCounter}" name="work-content-${rowCounter}" value="${data.workContent || ''}">
                </div>
                <div class="form-group">
                    <label for="remarks1-${rowCounter}">備考1</label>
                    <input type="text" id="remarks1-${rowCounter}" name="remarks1-${rowCounter}" value="${data.remarks1 || ''}">
                </div>
                <div class="form-group">
                    <label for="remarks2-${rowCounter}">備考2</label>
                    <input type="text" id="remarks2-${rowCounter}" name="remarks2-${rowCounter}" value="${data.remarks2 || ''}">
                </div>
            </div>
            <button type="button" class="delete-row">削除</button>
        `;

        // Attach event listener for the delete button
        newBlock.querySelector('.delete-row').addEventListener('click', (e) => {
            e.target.closest('.entry-block').remove();
        });

        return newBlock;
    }

    // Function to collect all form data
    function collectFormData() {
        const allEntries = [];
        const entryBlocks = form.querySelectorAll('.entry-block');
        entryBlocks.forEach(block => {
            const entry = {};
            entry.date = block.querySelector('[name^="date"]').value;
            entry.name = block.querySelector('[name^="name"]').value;
            entry.workNumber = block.querySelector('[name^="work-number"]').value;
            entry.moldNumber = block.querySelector('[name^="mold-number"]').value;
            entry.taskNumber = block.querySelector('[name^="task-number"]').value;
            entry.startTime = block.querySelector('[name^="start-time"]').value;
            entry.endTime = block.querySelector('[name^="end-time"]').value;
            entry.workContent = block.querySelector('[name^="work-content"]').value;
            entry.remarks1 = block.querySelector('[name^="remarks1"]').value;
            entry.remarks2 = block.querySelector('[name^="remarks2"]').value;
            allEntries.push(entry);
        });
        console.log('Collected form data:', allEntries); // Debugging
        return allEntries;
    }

    // Function to populate form data
    function populateFormData(data) {
        // Clear all existing entry blocks
        form.innerHTML = '';
        rowCounter = 0; // Reset counter for fresh population

        console.log('Populating form with data:', data); // Debugging

        if (data.length > 0) {
            data.forEach(entry => {
                form.appendChild(createEntryBlockElement(entry));
            });
        } else {
            // If no data, add one empty row
            form.appendChild(createEntryBlockElement({}));
        }
    }

    // Load data on page load
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');

    if (dateParam) {
        currentSaveDate = dateParam; // Set the save date from URL
        const storageKey = `${name}_${dateParam}`;
        console.log('Loading data for storageKey:', storageKey); // Debugging
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                populateFormData(parsedData);
            } catch (e) {
                console.error('Error parsing saved data from localStorage:', e);
                alert('保存されたデータの読み込み中にエラーが発生しました。');
                // Fallback to an empty form for the date
                populateFormData([
                    { date: dateParam, name: name }
                ]);
            }
        }
    } else {
        // If no date param, set today's date as default and populate an empty form
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(today.getDate()).padStart(2, '0');
        const todayDate = `${yyyy}-${mm}-${dd}`;
        currentSaveDate = todayDate; // Set the save date to today
        populateFormData([
            { date: todayDate, name: name }
        ]);
    }

    addRowButton.addEventListener('click', () => {
        const entryBlocks = form.querySelectorAll('.entry-block');
        const lastEntryBlock = entryBlocks[entryBlocks.length - 1];
        const lastEndTime = lastEntryBlock.querySelector('[name^="end-time"]').value;

        // Use currentSaveDate for new rows
        form.appendChild(createEntryBlockElement({ date: currentSaveDate, name: name, startTime: lastEndTime }));
    });

    saveButton.addEventListener('click', () => {
        const formData = collectFormData();
        if (!currentSaveDate) {
            alert('保存する日付が設定されていません。');
            return;
        }
        const storageKey = `${name}_${currentSaveDate}`;
        if (formData.length === 0) {
            localStorage.removeItem(storageKey);
            alert('作業票のデータを削除しました！');
            console.log('Removed data for:', storageKey); // Debugging
        } else {
            localStorage.setItem(storageKey, JSON.stringify(formData));
            alert('作業票を保存しました！');
            console.log('Saved data:', formData); // Debugging
        }
        console.log('Saved data:', formData); // Debugging
    });

    calendarLinkButton.addEventListener('click', () => {
        window.location.href = `calendar.html?name=${encodeURIComponent(name)}`;
    });
});
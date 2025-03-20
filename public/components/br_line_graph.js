export class BrCustomLineGraph extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = [];
        this.maxValue = 0;
        this.highlightedPoint = null;
        this._init();
    }

    static get observedAttributes() {
        return ['data', 'title', 'currency', 'highlight-point', 'comparison-value'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data' && newValue) {
            try {
                this.data = JSON.parse(newValue);
                setTimeout(() => this._updateGraph(), 10);
            } catch (e) {
                console.error('Invalid data format for line graph', e);
            }
        }

        if (name === 'highlight-point' && newValue) {
            this.highlightedPoint = parseInt(newValue, 10);
            setTimeout(() => this._updateHighlight(), 50);
        }

        if (name === 'comparison-value' && newValue) {
            this.comparisonValue = parseFloat(newValue.replace(/,/g, ''));
        }
    }

    _init() {
        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: inherit;
        color: inherit;
      }

      .template{
        width: 100%;
        height: 100%;
      }
      
      .graph-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 250px;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .graph-inner {
        position: relative;
        flex: 1;
        width: 100%;
        padding: 20px 10px 0 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      
      svg {
        display: block;
        width: 100%;
        flex-grow: 1;
        min-height: 0;
      }
      
      .graph-line {
        fill: none;
        stroke: var(--light_pri_color);
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
      }
      
      .graph-area {
        fill: var(--pri_op3);
      }
      
      .graph-point {
        fill: #fff;
        stroke: var(--light_pri_color);
        stroke-width: 2;
        r: 4;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .graph-point:hover, .graph-point.highlighted {
        r: 6;
        stroke-width: 3;
      }
      
      .point-highlight {
        fill: var(--light_pri_color);
        r: 3;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .point-highlight.visible {
        opacity: 1;
      }
      
      .x-axis-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 15px 10px 10px 10px;
        color: var(--gray_text);
        font-size: 12px;
        box-sizing: border-box;
      }
      
      .tooltip {
        position: absolute;
        background: var(--main_background);
        color: inherit;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        pointer-events: none;
        opacity: 0;
        transform: translateY(5px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        text-align: center;
        min-width: 110px;
        line-height: 1.2;
      }
      
      .tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .tooltip-value {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 2px;
      }
      
      .tooltip-date {
        font-size: 10px;
        opacity: 0.7;
      }
      
      .horizontal-line {
        stroke: var(--gray_text);
        opacity: 0.1;
        stroke-width: 1;
      }
    `;

        const template = document.createElement('div');
        template.className='template';
        template.innerHTML = `
      <div class="graph-container">
        <div class="graph-inner">
          <svg preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="rgba(73, 134, 252, 0.2)"></stop>
                <stop offset="100%" stop-color="rgba(73, 134, 252, 0)"></stop>
              </linearGradient>
            </defs>
            <g class="grid-lines"></g>
            <path class="graph-area" d=""></path>
            <path class="graph-line" d=""></path>
            <g class="points-container"></g>
            <g class="highlight-container"></g>
          </svg>
          
          <div class="tooltip">
            <div class="tooltip-value">$74,735.00</div>
            <div class="tooltip-date">Jul GMT + 8</div>
          </div>
          
          <div class="x-axis-labels">
            <!-- Labels will be dynamically generated -->
          </div>
        </div>
      </div>
    `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(template);

        this._setupEventListeners();
    }

    _setupEventListeners() {
        const graphContainer = this.shadowRoot.querySelector('.graph-inner');
        const svg = this.shadowRoot.querySelector('svg');

        // Track mouse movements over the graph for tooltip positioning
        svg.addEventListener('mousemove', (e) => {
            if (!this.data || this.data.length === 0) return;

            const svgRect = svg.getBoundingClientRect();
            const mouseX = e.clientX - svgRect.left;

            // Find the closest point to mouse position
            const containerWidth = svgRect.width;
            const pointWidth = containerWidth / (this.data.length - 1);
            const closestPointIndex = Math.min(
                Math.max(0, Math.round(mouseX / pointWidth)),
                this.data.length - 1
            );

            this._showTooltipAtIndex(closestPointIndex);
        });

        // Hide tooltip when mouse leaves the graph
        svg.addEventListener('mouseleave', () => {
            // Only hide if we're not showing a highlighted point
            if (this.highlightedPoint === null) {
                this._hideTooltip();
                this._clearHighlights();
            } else {
                this._updateHighlight();
            }
        });

        // Handle window resize
        window.addEventListener('resize', this._debounce(() => {
            this._updateGraph();
        }, 200));
    }

    _debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    _updateGraph() {
        if (!this.data || this.data.length === 0) return;

        const svg = this.shadowRoot.querySelector('svg');
        if (!svg) return;

        // Set explicit dimensions to ensure the SVG has proper size
        const container = this.shadowRoot.querySelector('.graph-container');
        const containerRect = container.getBoundingClientRect();

        // Ensure SVG has dimensions
        const svgRect = svg.getBoundingClientRect();
        const width = svgRect.width;
        const height = svgRect.height;

        if (width <= 0 || height <= 0) {
            // Try again if dimensions aren't ready
            setTimeout(() => this._updateGraph(), 100);
            return;
        }

        const pointsContainer = this.shadowRoot.querySelector('.points-container');
        const highlightContainer = this.shadowRoot.querySelector('.highlight-container');
        const gridLines = this.shadowRoot.querySelector('.grid-lines');

        // Clear previous elements
        pointsContainer.innerHTML = '';
        highlightContainer.innerHTML = '';
        gridLines.innerHTML = '';

        // Find max value for scaling
        this.maxValue = Math.max(...this.data.map(item => item.value)) * 1.2;

        // Create path for line
        const linePath = this.shadowRoot.querySelector('.graph-line');
        const areaPath = this.shadowRoot.querySelector('.graph-area');

        let linePathD = '';
        let areaPathD = '';

        // Add padding
        const paddingX = 0;
        const paddingY = 20;
        const usableWidth = width;
        const usableHeight = height - paddingY;

        // Create horizontal grid lines (now 5 lines including top and bottom borders)
        // Add top border
        const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        topLine.setAttribute('x1', paddingX);
        topLine.setAttribute('y1', paddingY);
        topLine.setAttribute('x2', width);
        topLine.setAttribute('y2', paddingY);
        topLine.setAttribute('class', 'horizontal-line');
        gridLines.appendChild(topLine);

        // Middle lines (3 evenly spaced)
        for (let i = 1; i <= 3; i++) {
            const y = paddingY + ((usableHeight / 4) * i);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', paddingX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'horizontal-line');
            gridLines.appendChild(line);
        }

        // Add bottom border
        const bottomLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bottomLine.setAttribute('x1', paddingX);
        bottomLine.setAttribute('y1', height);
        bottomLine.setAttribute('x2', width);
        bottomLine.setAttribute('y2', height);
        bottomLine.setAttribute('class', 'horizontal-line');
        gridLines.appendChild(bottomLine);

        // Store point coordinates for later use
        this.pointCoordinates = [];

        // Create the line and points
        this.data.forEach((point, index) => {
            const x = paddingX + ((usableWidth / (this.data.length - 1)) * index);
            const rawY = (point.value / this.maxValue) * usableHeight;
            const y = paddingY + (usableHeight - rawY);

            // Store coordinates
            this.pointCoordinates.push({ x, y, value: point.value, date: point.date });

            // Add to path
            if (index === 0) {
                linePathD = `M ${x},${y}`;
                areaPathD = `M ${x},${height} L ${x},${y}`;
            } else {
                linePathD += ` L ${x},${y}`;
                areaPathD += ` L ${x},${y}`;
            }

            // Create point circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('class', 'graph-point');
            circle.setAttribute('data-index', index);
            pointsContainer.appendChild(circle);

            // Create highlight inner dot (invisible by default)
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            highlight.setAttribute('cx', x);
            highlight.setAttribute('cy', y);
            highlight.setAttribute('class', 'point-highlight');
            highlight.setAttribute('data-index', index);
            highlightContainer.appendChild(highlight);
        });

        // Close the area path
        areaPathD += ` L ${width},${height} L ${paddingX},${height} Z`;

        // Update the SVG paths
        linePath.setAttribute('d', linePathD);
        areaPath.setAttribute('d', areaPathD);

        // Update x-axis labels based on actual data
        this._updateAxisLabels();

        // Set highlight if needed
        if (this.highlightedPoint !== null) {
            setTimeout(() => this._updateHighlight(), 100);
        }
    }

    _updateAxisLabels() {
        const labelsContainer = this.shadowRoot.querySelector('.x-axis-labels');
        if (!labelsContainer || !this.data || this.data.length === 0) return;
        
        // Clear existing labels
        labelsContainer.innerHTML = '';
        
        // Determine how many labels to show
        const maxLabels = Math.min(12, this.data.length);
        const labelStep = Math.ceil(this.data.length / maxLabels);
        
        // Create new labels based on data
        for (let i = 0; i < this.data.length; i += labelStep) {
            const labelData = this.data[i];
            const label = document.createElement('span');
            
            // Extract label text from date field in the data
            // This assumes the date field contains something like "Jan GMT + 8"
            // We'll extract just the first part before any space
            const labelText = labelData.date.split(' ')[0];
            label.textContent = labelText;
            
            labelsContainer.appendChild(label);
        }
        
        // Add the last label if it's not already included
        const lastIndex = this.data.length - 1;
        if (lastIndex % labelStep !== 0) {
            const labelData = this.data[lastIndex];
            const label = document.createElement('span');
            label.textContent = labelData.date.split(' ')[0];
            labelsContainer.appendChild(label);
        }
    }

    _showTooltipAtIndex(index) {
        if (!this.pointCoordinates || index >= this.pointCoordinates.length) return;

        const point = this.pointCoordinates[index];
        const tooltip = this.shadowRoot.querySelector('.tooltip');
        const container = this.shadowRoot.querySelector('.graph-container');

        // Update tooltip content
        tooltip.querySelector('.tooltip-value').textContent =
            `$${parseFloat(point.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        tooltip.querySelector('.tooltip-date').textContent = point.date;

        // Make tooltip visible but off-screen to measure its size
        tooltip.style.left = '-9999px';
        tooltip.style.top = '-9999px';
        tooltip.classList.add('visible');

        // Get measurements
        const tooltipRect = tooltip.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate position with boundary checks
        let leftPos = point.x - (tooltipRect.width / 2);

        // Prevent overflowing left edge
        if (leftPos < 10) {
            leftPos = 10;
        }

        // Prevent overflowing right edge
        if (leftPos + tooltipRect.width > containerRect.width - 10) {
            leftPos = containerRect.width - tooltipRect.width - 10;
        }

        // Position closer to the point - just 8px above
        let topPos = point.y - tooltipRect.height - 8;

        // Prevent overflowing top edge
        if (topPos < 5) {
            // If too high, position below the point instead
            topPos = point.y + 8;
        }

        // Set final position
        tooltip.style.left = `${leftPos}px`;
        tooltip.style.top = `${topPos}px`;

        // Highlight the point
        this._clearHighlights();

        const pointHighlights = this.shadowRoot.querySelectorAll('.point-highlight');
        if (pointHighlights[index]) {
            pointHighlights[index].classList.add('visible');
        }

        const pointCircles = this.shadowRoot.querySelectorAll('.graph-point');
        if (pointCircles[index]) {
            pointCircles[index].classList.add('highlighted');
        }
    }

    _hideTooltip() {
        const tooltip = this.shadowRoot.querySelector('.tooltip');
        tooltip.classList.remove('visible');
    }

    _clearHighlights() {
        // Clear all highlights
        this.shadowRoot.querySelectorAll('.graph-point').forEach(point => {
            point.classList.remove('highlighted');
        });

        this.shadowRoot.querySelectorAll('.point-highlight').forEach(highlight => {
            highlight.classList.remove('visible');
        });
    }

    _updateHighlight() {
        if (this.highlightedPoint === null || !this.data || this.highlightedPoint >= this.data.length) return;

        // Make sure we have point coordinates
        if (!this.pointCoordinates || this.pointCoordinates.length === 0) {
            setTimeout(() => this._updateHighlight(), 100);
            return;
        }

        this._showTooltipAtIndex(this.highlightedPoint);
    }

    connectedCallback() {
        // Use a sequence of delayed updates to ensure the graph renders properly
        [50, 150, 300, 500, 1000].forEach(delay => {
            setTimeout(() => {
                if (this.isConnected) {
                    this._updateGraph();
                }
            }, delay);
        });

        // Set up resize observer
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                this._updateGraph();
            });
            this.resizeObserver.observe(this);
        }
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    // Helper method to set data programmatically
    setData(data) {
        this.data = data;
        this._updateGraph();
    }
} 
import matplotlib.pyplot as plt
import numpy as np
import re
from collections import defaultdict

def parse_eval_log(filename):
    """Parse the evaluation log file and extract timing data."""
    data = defaultdict(lambda: defaultdict(dict))
    
    with open(filename, 'r') as f:
        content = f.read()
    
    # Extract timing data using regex
    pattern = r'(\w+) - Problem (problem_\d+), variant (\d+): ([\d.]+)s'
    matches = re.findall(pattern, content)
    
    for model, problem, variant, time in matches:
        time_float = float(time)
        if time_float > 0:  # Skip zero times as requested
            data[model][problem][f'variant_{variant}'] = time_float
    
    # Also extract final synthesis times
    final_pattern = r'(\w+) - Problem (problem_\d+), final synthesis: ([\d.]+)s'
    final_matches = re.findall(final_pattern, content)
    
    for model, problem, time in final_matches:
        time_float = float(time)
        if time_float > 0:  # Skip zero times as requested
            data[model][problem]['final_synthesis'] = time_float
    
    return data

def create_chart(data):
    """Create the chart showing Average Solving Time for each problem and model."""
    
    # Get all problems (sorted)
    all_problems = set()
    for model_data in data.values():
        all_problems.update(model_data.keys())
    problems = sorted(list(all_problems), key=lambda x: int(x.split('_')[1]))
    
    # Get all models
    models = list(data.keys())
    
    # Define colors for each model
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2']
    model_colors = {model: colors[i % len(colors)] for i, model in enumerate(models)}
    
    # Calculate average times for each model and problem
    avg_times = defaultdict(lambda: defaultdict(float))
    
    for model in models:
        for problem in problems:
            if problem in data[model]:
                times = []
                for variant_key, time in data[model][problem].items():
                    if time > 0:  # Only include non-zero times
                        times.append(time)
                
                if times:  # Only calculate average if there are valid times
                    avg_times[model][problem] = np.mean(times)
    
    # Set up the plot
    fig, ax = plt.subplots(figsize=(14, 8))
    
    # Set positions for bars
    x = np.arange(len(problems))
    width = 0.15
    multiplier = 0
    
    # Plot bars for each model
    for model in models:
        model_times = [avg_times[model][problem] for problem in problems]
        offset = width * multiplier
        bars = ax.bar(x + offset, model_times, width, label=model, 
                     color=model_colors[model], alpha=0.8, edgecolor='white', linewidth=0.5)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            if height > 0:  # Only label non-zero bars
                ax.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                       f'{height:.1f}', ha='center', va='bottom', fontsize=8, rotation=0)
        
        multiplier += 1
    
    # Customize the chart
    ax.set_ylabel('Average Solving Time (seconds)', fontsize=12, fontweight='bold')
    ax.set_xticks(x + width * (len(models) - 1) / 2)
    ax.set_xticklabels([p.replace('_', ' ').title() for p in problems], rotation=45, ha='right')
    
    # Add legend
    ax.legend(title='Models', loc='upper left', frameon=True, fancybox=True, shadow=True)
    
    # Add grid for better readability
    ax.grid(True, alpha=0.3, linestyle='--', axis='y')
    ax.set_axisbelow(True)
    
    # Set y-axis to start from 0
    ax.set_ylim(bottom=0)
    
    # Improve layout
    plt.tight_layout()
    
    # Add some styling
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#CCCCCC')
    ax.spines['bottom'].set_color('#CCCCCC')
    
    return fig

def main():
    """Main function to run the analysis and create the chart."""
    # Parse the evaluation log
    print("Parsing evaluation log...")
    data = parse_eval_log('eval_log.txt')
    
    # Print summary statistics
    print("\nSummary of parsed data:")
    for model, model_data in data.items():
        print(f"\n{model.upper()}:")
        for problem, variants in model_data.items():
            valid_times = [t for t in variants.values() if t > 0]
            if valid_times:
                avg_time = np.mean(valid_times)
                print(f"  {problem}: {len(valid_times)} valid measurements, avg = {avg_time:.1f}s")
    
    # Create and display the chart
    print("\nCreating chart...")
    fig = create_chart(data)
    
    # Save the chart
    plt.savefig('evaluation_chart.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    print("Chart saved as 'evaluation_chart.png'")
    
    # Display the chart
    plt.show()

if __name__ == "__main__":
    main()

import yaml
from jinja2 import Environment, FileSystemLoader
import argparse
import os
from pathlib import Path

class BlogTemplateGenerator:
    def __init__(self, template_dir='.'):
        self.template_dir = Path(template_dir)
        self.env = Environment(loader=FileSystemLoader(template_dir))
    
    def load_formulas(self, yaml_file):
        """Load mathematical formulas from YAML file."""
        # Look for the YAML file in the template directory
        yaml_path = self.template_dir / yaml_file
        
        try:
            with open(yaml_path, 'r', encoding='utf-8') as file:
                return yaml.safe_load(file) or {}
        except FileNotFoundError:
            print(f"Warning: Formula file {yaml_path} not found. Using empty formulas.")
            return {}
    
    def generate_template(self, template_file, formulas_file, output_file, **extra_vars):
        """Generate template with formulas and any extra variables."""
        
        # Load formulas
        formulas = self.load_formulas(formulas_file)
        
        # Load template
        try:
            template = self.env.get_template(template_file)
        except Exception as e:
            print(f"Error loading template {template_file} from {self.template_dir}: {e}")
            return False
        
        # Prepare template variables
        template_vars = {
            'formulas': formulas,
            **extra_vars  # Allow passing additional variables
        }
        
        # Generate HTML
        try:
            generated_content = template.render(**template_vars)
        except Exception as e:
            print(f"Error rendering template: {e}")
            return False
        
        # Save generated template
        try:
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as file:
                file.write(generated_content)
            
            print(f"✅ Template generated successfully: {output_file}")
            return True
            
        except Exception as e:
            print(f"Error saving file {output_file}: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Generate blog posts with formulas from YAML')
    parser.add_argument('--template', '-t', 
                       default='blog_post_template.html.j2',
                       help='Template file (default: blog_post_template.html.j2)')
    parser.add_argument('--formulas', '-f',
                       default='template_formulas.yml',
                       help='Formulas YAML file (default: template_formulas.yml)')
    parser.add_argument('--output', '-o',
                       default='blog_post_template_generated.html',
                       help='Output HTML file (default: blog_post_template_generated.html)')
    parser.add_argument('--template-dir', '-d',
                       default='./template',
                       help='Directory containing templates (default: ./template)')
    
    args = parser.parse_args()
    
    # Create generator with the specified template directory
    generator = BlogTemplateGenerator(template_dir=args.template_dir)
    
    # Generate template
    success = generator.generate_template(
        template_file=args.template,
        formulas_file=args.formulas,
        output_file=args.output
    )
    
    if success:
        print("\nFiles used:")
        print(f"- Template directory: {args.template_dir}")
        print(f"- {Path(args.template_dir) / args.formulas} (formula definitions)")
        print(f"- {Path(args.template_dir) / args.template} (Jinja2 template)")
        print(f"- {args.output} (generated HTML)")
    else:
        print("❌ Template generation failed!")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
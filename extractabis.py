import os
import json

def extract_contract_data():
    src_dir = 'src'
    out_dir = 'out'
    export_dir = 'contract_data'

    # Create the export directory if it doesn't exist
    if not os.path.exists(export_dir):
        os.makedirs(export_dir)

    # Walk through the out directory
    for root, dirs, files in os.walk(out_dir):
        for file in files:
            if file.endswith('.json'):
                # Construct the full path to the JSON file
                json_path = os.path.join(root, file)
                
                # Read the JSON file
                with open(json_path, 'r') as f:
                    data = json.load(f)
                
                # Check if the file has both ABI and bytecode
                if 'abi' in data and 'bytecode' in data:
                    # Extract the contract name from the file path
                    contract_name = os.path.splitext(file)[0]
                    
                    # Check if there's a corresponding .sol file in src
                    sol_file = f"{contract_name}.sol"
                    if os.path.exists(os.path.join(src_dir, sol_file)):
                        # Prepare the export data
                        export_data = {
                            "abi": data['abi'],
                            "bytecode": data['bytecode']
                        }
                        
                        # Write the data to a new file
                        export_file = f"{contract_name}.json"
                        export_path = os.path.join(export_dir, export_file)
                        with open(export_path, 'w') as f:
                            json.dump(export_data, f, indent=2)
                        print(f"Extracted ABI and bytecode for {contract_name}")

if __name__ == "__main__":
    extract_contract_data()
#!/usr/bin/env python3
"""
imc_math_llm_eval.py

Benchmark state-of-the-art LLMs on IMC math contest problems.
"""

import os
import json
import time
import requests
from requests.exceptions import RequestException
import random

import openai
from openai import OpenAI
import google.generativeai as genai
from anthropic import Client

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('.env')

# OpenAI
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
openai.api_key = OPENAI_API_KEY

# Initialize the client (preferably at the module level)
client = OpenAI()  # This will use the OPENAI_API_KEY environment variable

# DeepSeek (via Nebius)
NEBIUS_API_KEY = os.environ["NEBIUS_API_KEY"]

# Google Gemini
GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]
genai.configure(api_key=GOOGLE_API_KEY)

# Anthropic Claude
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]  # Added missing variable
claude_client = Client(api_key=ANTHROPIC_API_KEY)

# XAI API Key for Grok
XAI_API_KEY = os.environ["XAI_API_KEY"]  # Added missing variable

# Shared generation parameters
GEN_PARAMS = {
    "temperature": 0.7
}

SYSTEM_PROMPT = (
    """You are a highly advanced AI math tutor and problem solver. 
    You have expertise in university-level mathematics and can solve challenging competition problems.  
    
    You will be given a difficult math problem. **Think step-by-step** 
    and work out the solution in a logical, rigorous manner.  
    You are allowed to use tools or calculations as needed 
    (for example, you might do arithmetic or write python code in your reasoning 
    if the interface allows).
    
    Important note: please do not use search. We want to test your ability to solve 
    extremely difficult math problems, not your ability to search for solutions on the Internet.
    
    Express your reasoning **clearly and systematically**, using proper mathematical 
    notation (LaTeX) for formulas.  
    Do not give up or skip steps – if the problem is hard, break it down 
    and **consider different approaches** (algebraic manipulation, 
    trying small cases, using known theorems (do not search anything), etc.).  
    At the end, **provide the final answer** explicitly on a separate line, 
    labeled as "Final answer." If the problem asks for a proof, 
    provide a complete proof. If it asks for a numerical or algebraic answer, 
    give that result.  
    Do not output any extraneous commentary or mention that you are an AI; 
    stay focused on the problem.
    """
)

def call_openai(model: str, system: str, user: str):
    if not OPENAI_API_KEY:
        return "Error: OPENAI_API_KEY is not configured", 0

    try:
        start_time = time.time()

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ]
        )
        end_time = time.time()
        duration = end_time - start_time
        return response.choices[0].message.content.strip(), duration
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return None, 0


def call_deepseek(model: str, system: str, user: str) -> tuple[str, float]:
    if not NEBIUS_API_KEY:
        return "Error: NEBIUS_API_KEY not configured", 0

    client_nebius = OpenAI(
        base_url="https://api.studio.nebius.com/v1/",
        api_key=os.environ.get("NEBIUS_API_KEY")
    )

    start_time = time.time()
    response = client_nebius.chat.completions.create(
        model=model,
        **GEN_PARAMS,
        messages=[
            {
                "role": "system",
                "content": system
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": user
                    }
                ]
            }
        ]
    )
    end_time = time.time()
    duration = end_time - start_time
    return response.choices[0].message.content.strip(), duration


def call_gemini(model: str, system: str, user: str) -> tuple[str, float]:
    if not GOOGLE_API_KEY:
        return "Error: GOOGLE_API_KEY is not configured", 0

    try:
        model = genai.GenerativeModel(model)

        chat = model.start_chat(history=[
            {
                "role": "user",
                "parts": [system]
            },
            {
                "role": "model",
                "parts": ["Understood. I will follow your instructions."]
            }
        ])

        # Send the user's message with the requested parameters
        start_time = time.time()
        response = chat.send_message(
            user,
            generation_config=genai.types.GenerationConfig(
                temperature=GEN_PARAMS["temperature"],
                candidate_count=1
            )
        )
        end_time = time.time()
        duration = end_time - start_time

        return response.text.strip(), duration
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None, 0

def call_claude(model: str, system: str, user: str) -> tuple[str, float]:
    if not ANTHROPIC_API_KEY:
        return "Error: ANTHROPIC_API_KEY is not configured", 0

    try:
        start_time = time.time()

        stream = claude_client.messages.create(
            model=model,
            max_tokens=16000,
            stream=True,
            messages=[
                {
                    "role": "user",
                    "content": f"{system}\n\n{user}"
                }
            ],
            temperature=GEN_PARAMS["temperature"]
        )

        content = ""
        for event in stream:
            if event.type == "content_block_delta":
                content += event.delta.text

        end_time = time.time()
        duration = end_time - start_time
        return content.strip(), duration

    except Exception as e:
        print(f"Error calling Claude API: {e}")
        return f"Error: {str(e)}", 0


def call_grok(model: str, system: str, user: str) -> tuple[str, float]:
    if not XAI_API_KEY:
        return "Error: XAI_API_KEY is not configured", 0

    headers = {
        "Authorization": f"Bearer {os.environ['XAI_API_KEY']}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        **GEN_PARAMS
    }
    base_delay = 5.0 # Base delay in seconds
    max_retries = 2
    for attempt in range(max_retries+1):
        try:
            start_time = time.time()
            resp = requests.post(
                "https://api.x.ai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=3000 # Timeout in seconds
            )

            # Handle different HTTP status codes appropriately
            if resp.status_code == 200:
                duration = time.time() - start_time
                response_data = resp.json()
                return response_data['choices'][0]['message']['content'], duration

            elif resp.status_code in [502, 503, 504]:  # Server errors that might be temporary
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(
                        f"Server error {resp.status_code}, retrying in {delay:.2f} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    continue
                else:
                    print(f"Max retries reached. Server error {resp.status_code}: {resp.text}")
                    return None, 0

            elif resp.status_code == 429:  # Rate limiting
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"Rate limited, retrying in {delay:.2f} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    continue
                else:
                    print("Rate limit exceeded, max retries reached")
                    return None, 0

            else:
                # For other HTTP errors, don't retry
                print(f"HTTP error {resp.status_code}: {resp.text}")
                return None, 0

        except RequestException as e:
            if attempt < max_retries:
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Request failed: {e}, retrying in {delay:.2f} seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
                continue
            else:
                print(f"Request failed after {max_retries} retries: {e}")
                return None, 0

        except Exception as e:
            print(f"Unexpected error: {e}")
            return None, 0

    return None, 0


# === Benchmarking logic ===
def benchmark_model(name: str, call_fn, problems: list[dict]) -> list[dict]:
    all_results = []
    total_time = 0
    
    for prob in problems:
        pid = prob["id"]
        latex = prob["latex"]
        user_msg = f"Problem {pid}:\n```latex\n{latex}\n```"

        variants = []
        variant_times = []
        for i in range(3):
            out, duration = call_fn(SYSTEM_PROMPT, user_msg)
            variants.append(out)
            variant_times.append(duration)
            total_time += duration
            print(f"  {name} - Problem {pid}, variant {i+1}: {duration:.2f}s")
            time.sleep(1)  # gentle pacing to avoid rate limits

        # Synthesize a final solution
        synth_prompt = (
            f"Below are solution drafts for {user_msg}"
            "Please review them, check logic, "
            "fix all the possible errors and produce a concise, complete final solution."
            "Important note: please do not use search. We want to test your ability "
            "to solve extremely difficult math problems, "
            "not your ability to search for solutions on the Internet.\n\n"
        )
        for idx, sol in enumerate(variants, 1):
            synth_prompt += f"--- Solution {idx} ---\n{sol}\n\n"

        final_sol, final_duration = call_fn(SYSTEM_PROMPT, synth_prompt)
        total_time += final_duration
        print(f"  {name} - Problem {pid}, final synthesis: {final_duration:.2f}s")

        all_results.append({
            "id": pid,
            "round": prob.get("round"),
            "variants": variants,
            "variant_times": variant_times,
            "final": final_sol,
            "final_time": final_duration,
            "total_problem_time": sum(variant_times) + final_duration
        })
    
    print(f"Total time for {name}: {total_time:.2f}s")
    return all_results


def main():
    # Load IMC problems
    with open("problems.json", "r") as f:
        problems = json.load(f)

    models = {
        # "gpt": lambda s, u: call_openai("o3-2025-04-16", s, u),
        # "deepseek": lambda s, u: call_deepseek("deepseek-ai/DeepSeek-R1-0528", s, u),
        # "gemini": lambda s, u: call_gemini("gemini-2.5-pro", s, u),
        "claude": lambda s, u: call_claude("claude-opus-4-20250514", s, u),
        # "grok": lambda s, u: call_grok("grok-4", s, u),
    }

    results = {}
    overall_start_time = time.time()
    
    for name, fn in models.items():
        print(f"Running benchmark for {name}...")
        model_start_time = time.time()
        results[name] = benchmark_model(name, fn, problems)
        model_end_time = time.time()
        model_total_time = model_end_time - model_start_time
        
        # Add a timing summary to results
        results[name].append({
            "timing_summary": {
                "model_name": name,
                "total_model_time": model_total_time,
                "problems_count": len(problems),
                "average_time_per_problem": model_total_time / len(problems) if problems else 0
            }
        })
        
        print(f"Completed {name} in {model_total_time:.2f}s")
        
        # Save intermediate results in case of interruption
        with open(f"results_{name}.json", "w") as fout:
            json.dump(results[name], fout, indent=2)

    overall_end_time = time.time()
    overall_time = overall_end_time - overall_start_time

    # Add overall timing summary
    timing_summary = {
        "overall_benchmark_time": overall_time,
        "models_tested": list(models.keys()),
        "total_problems": len(problems),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    }

    # Final output
    final_results = {
        "timing_summary": timing_summary,
        "model_results": results
    }
    
    with open("results_all_models.json", "w") as fout:
        json.dump(final_results, fout, indent=2)
    
    print(f"Benchmarking complete in {overall_time:.2f}s. Results saved to results_all_models.json")


if __name__ == "__main__":
    main()
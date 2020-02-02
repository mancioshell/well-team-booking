## Install

```
npm install
```

## Configuration

Create a file config.json in your project directory.

```
{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
}

```

## Usage

book a new lesson

```
node index.js --action book --lesson "cross training" --day giovedi --start-time 19:00 --end-time 20:00
```

cancel a booked lesson

```
node index.js --action cancel --lesson "cross training" --day giovedi --start-time 19:00 --end-time 20:00
```
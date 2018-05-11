package main

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"

	"github.com/cenkalti/rpc2"
	"github.com/cenkalti/rpc2/jsonrpc"
)

type Data struct {
	Foo string `json:"foo"`
}

type RespData struct {
	Name string `json:"name"`
}

type Response struct {
	Method string      `json:"method"`
	Data   interface{} `json:"data"`
}

var wg sync.WaitGroup

func main() {
	conn, _ := net.Dial("tcp", "127.0.0.1:4000")

	clt := rpc2.NewClientWithCodec(jsonrpc.NewJSONCodec(conn))
	go clt.Run()
	clt.Handle("hello", func(client *rpc2.Client, args interface{}, resp *RespData) error {
		fmt.Printf("%v\n", args)
		buf, err := json.Marshal(args)

		if err != nil {
			panic(err)
		}
		var data RespData
		json.Unmarshal(buf, &data)
		*resp = data

		fmt.Println("hello called:", data.Name)

		return nil
	})

	data, err := json.Marshal(&Data{
		Foo: "bar",
	})
	if err != nil {
		panic(err)
	}

	// var resp RespData
	_ = clt.Call("add", data, nil)

}
